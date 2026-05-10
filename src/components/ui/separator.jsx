import * as React from "react"

const Separator = React.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <div
    ref={ref}
    role={decorative ? "none" : "separator"}
    aria-orientation={orientation}
    className={`shrink-0 bg-gray-200 dark:bg-gray-700 ${
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px"
    } ${className}`}
    {...props}
  />
))
Separator.displayName = "Separator"

export { Separator }