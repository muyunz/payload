import type { CollectionPermission, GlobalPermission, User } from 'payload/auth'
import type { AdminViewComponent } from 'payload/config'
import type {
  SanitizedCollectionConfig,
  SanitizedConfig,
  SanitizedGlobalConfig,
} from 'payload/types'

import { isEntityHidden } from 'payload/utilities'

import { APIView as DefaultAPIView } from '../API'
import { EditView as DefaultEditView } from '../Edit'
import { LivePreviewView as DefaultLivePreviewView } from '../LivePreview'
import { VersionView as DefaultVersionView } from '../Version'
import { VersionsView as DefaultVersionsView } from '../Versions'
import { getCustomViewByKey } from './getCustomViewByKey'
import { getCustomViewByPath } from './getCustomViewByPath'

export const getViewsFromConfig = async ({
  collectionConfig,
  config,
  docPermissions,
  globalConfig,
  routeSegments,
  user,
}: {
  collectionConfig?: SanitizedCollectionConfig
  config: SanitizedConfig
  docPermissions: CollectionPermission | GlobalPermission
  globalConfig?: SanitizedGlobalConfig
  routeSegments: string[]
  user: User
}): Promise<{
  CustomView: AdminViewComponent
  DefaultView: AdminViewComponent
} | null> => {
  // Conditionally import and lazy load the default view
  let DefaultView: AdminViewComponent = null
  let CustomView: AdminViewComponent = null
  const [entityType, entitySlug, createOrID, tabViewName, segmentFive] = routeSegments
  const views =
    (collectionConfig && collectionConfig?.admin?.components?.views) ||
    (globalConfig && globalConfig?.admin?.components?.views)

  const livePreviewEnabled =
    (collectionConfig && collectionConfig?.admin?.livePreview) ||
    config?.admin?.livePreview?.collections?.includes(collectionConfig?.slug) ||
    (globalConfig && globalConfig?.admin?.livePreview) ||
    config?.admin?.livePreview?.globals?.includes(globalConfig?.slug)

  if (collectionConfig) {
    const {
      admin: { hidden },
    } = collectionConfig

    if (isEntityHidden({ hidden, user })) {
      return null
    }

    // `../:id`, or `../create`
    if (!tabViewName) {
      switch (createOrID) {
        case 'create': {
          if ('create' in docPermissions && docPermissions?.create?.permission) {
            CustomView = getCustomViewByKey(views, 'Default')
            DefaultView = DefaultEditView
          }
          break
        }

        default: {
          if (docPermissions?.read?.permission) {
            CustomView = getCustomViewByKey(views, 'Default')
            DefaultView = DefaultEditView
          }
        }
      }
    }

    if (tabViewName) {
      // `../:id/versions/:version`, etc
      if (segmentFive) {
        if (tabViewName === 'versions') {
          if (docPermissions?.readVersions?.permission) {
            CustomView = getCustomViewByKey(views, 'Version')
            DefaultView = DefaultVersionView
          }
        }
      }

      // `../:id/api`, `../:id/preview`, `../:id/versions`, etc
      if (routeSegments?.length === 4) {
        switch (tabViewName) {
          case 'api': {
            if (collectionConfig?.admin?.hideAPIURL !== true) {
              CustomView = getCustomViewByKey(views, 'API')
              DefaultView = DefaultAPIView
            }
            break
          }

          case 'preview': {
            if (livePreviewEnabled) {
              DefaultView = DefaultLivePreviewView
            }
            break
          }

          case 'versions': {
            if (docPermissions?.readVersions?.permission) {
              CustomView = getCustomViewByKey(views, 'Versions')
              DefaultView = DefaultVersionsView
            }
            break
          }

          default: {
            const path = `/${tabViewName}`
            CustomView = getCustomViewByPath(views, path)
            break
          }
        }
      }
    }
  }

  if (globalConfig) {
    const {
      admin: { hidden },
    } = globalConfig

    if (isEntityHidden({ hidden, user })) {
      return null
    }

    if (!routeSegments?.length) {
      if (docPermissions?.read?.permission) {
        CustomView = getCustomViewByKey(views, 'Default')
        DefaultView = DefaultEditView
      }
    } else if (routeSegments?.length === 1) {
      // `../:slug/api`, `../:slug/preview`, `../:slug/versions`, etc
      switch (tabViewName) {
        case 'api': {
          if (globalConfig?.admin?.hideAPIURL !== true) {
            CustomView = getCustomViewByKey(views, 'API')
            DefaultView = DefaultAPIView
          }
          break
        }

        case 'preview': {
          if (livePreviewEnabled) {
            DefaultView = DefaultLivePreviewView
          }
          break
        }

        case 'versions': {
          if (docPermissions?.readVersions?.permission) {
            CustomView = getCustomViewByKey(views, 'Versions')
            DefaultView = DefaultVersionsView
          }
          break
        }

        default: {
          if (docPermissions?.read?.permission) {
            CustomView = getCustomViewByKey(views, 'Default')
            DefaultView = DefaultEditView
          }
          break
        }
      }
    } else if (routeSegments?.length === 2) {
      // `../:slug/versions/:version`, etc
      if (tabViewName === 'versions') {
        if (docPermissions?.readVersions?.permission) {
          CustomView = getCustomViewByKey(views, 'Version')
          DefaultView = DefaultVersionView
        }
      }
    }
  }

  return {
    CustomView,
    DefaultView,
  }
}