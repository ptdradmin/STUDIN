
import * as React from "react"
import { ClipboardCheck } from "lucide-react"

export const ClipboardCheckIcon = React.forwardRef<
  SVGSVGElement,
  React.ComponentPropsWithoutRef<typeof ClipboardCheck>
>((props, ref) => <ClipboardCheck ref={ref} {...props} />)
ClipboardCheckIcon.displayName = "ClipboardCheckIcon"
