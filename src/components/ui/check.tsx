
import * as React from "react"
import { Check } from "lucide-react"

export const CheckIcon = React.forwardRef<
  SVGSVGElement,
  React.ComponentPropsWithoutRef<typeof Check>
>((props, ref) => <Check ref={ref} {...props} />)
CheckIcon.displayName = "CheckIcon"
