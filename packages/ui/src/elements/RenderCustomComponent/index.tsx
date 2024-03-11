import React from 'react'

export const RenderCustomComponent: React.FC<{
  CustomComponent?: React.ComponentType<any>
  DefaultComponent: React.ComponentType<any>
  componentProps?: Record<string, any>
}> = (props) => {
  const { CustomComponent, DefaultComponent, componentProps = {} } = props

  if (CustomComponent) {
    return <CustomComponent {...componentProps} />
  }

  if (DefaultComponent) {
    return <DefaultComponent {...componentProps} />
  }

  return null
}