'use client'

import type { JoinFieldProps, PaginatedDocs, Where } from 'payload'

import React, { useMemo } from 'react'

import { RelationshipTable } from '../../elements/RelationshipTable/index.js'
import { FieldLabel } from '../../fields/FieldLabel/index.js'
import { useFieldProps } from '../../forms/FieldPropsProvider/index.js'
import { useField } from '../../forms/useField/index.js'
import { withCondition } from '../../forms/withCondition/index.js'
import { useDocumentInfo } from '../../providers/DocumentInfo/index.js'
import { fieldBaseClass } from '../index.js'

const JoinFieldComponent: React.FC<JoinFieldProps> = (props) => {
  const {
    field,
    field: {
      name,
      _path: pathFromProps,
      admin: {
        components: { Label },
      },
      collection,
      label,
      on,
    },
  } = props

  const { id: docID } = useDocumentInfo()

  const { path: pathFromContext, readOnly: readOnlyFromContext } = useFieldProps()

  const { path, value } = useField<PaginatedDocs>({
    path: pathFromContext ?? pathFromProps ?? name,
  })

  const filterOptions: Where = useMemo(
    () => ({
      [on]: {
        in: [docID || null],
      },
    }),
    [docID, on],
  )

  return (
    <div className={[fieldBaseClass, 'join'].filter(Boolean).join(' ')}>
      <RelationshipTable
        Label={
          <h4 style={{ margin: 0 }}>
            <FieldLabel Label={Label} as="span" field={field} label={label} />
          </h4>
        }
        field={field}
        filterOptions={filterOptions}
        initialData={docID && value ? value : ({ docs: [] } as PaginatedDocs)}
        relationTo={collection}
      />
    </div>
  )
}

export const JoinField = withCondition(JoinFieldComponent)