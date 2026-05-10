import * as React from "react"
import { ChevronDown, Check } from "lucide-react" // Add this import

const Select = ({ value, onValueChange, children }) => {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef(null)
  
  // Find the trigger and value components
  let trigger = null
  let content = null
  
  React.Children.forEach(children, child => {
    if (child.type === SelectTrigger) {
      trigger = child
    }
    if (child.type === SelectContent) {
      content = child
    }
  })

  // Find the selected value label
  const selectedLabel = React.useMemo(() => {
    if (!content) return null
    let label = null
    React.Children.forEach(content.props.children, child => {
      if (child.type === SelectItem && child.props.value === value) {
        label = child.props.children
      }
    })
    return label
  }, [content, value])

  return (
    <div className="relative">
      {/* Trigger */}
      <div onClick={() => setOpen(!open)} ref={triggerRef}>
        {trigger ? React.cloneElement(trigger, { 
          children: selectedLabel || trigger.props.children,
          value 
        }) : (
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop to close on outside click */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)}
          />
          
          {/* Options */}
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="py-1">
              {content && React.Children.map(content.props.children, child => {
                if (child.type === SelectItem) {
                  return React.cloneElement(child, { 
                    onSelect: (val) => {
                      onValueChange(val)
                      setOpen(false)
                    },
                    selected: child.props.value === value
                  })
                }
                if (child.type === SelectGroup) {
                  return React.cloneElement(child, { 
                    children: React.Children.map(child.props.children, groupChild => {
                      if (groupChild.type === SelectItem) {
                        return React.cloneElement(groupChild, { 
                          onSelect: (val) => {
                            onValueChange(val)
                            setOpen(false)
                          },
                          selected: groupChild.props.value === value
                        })
                      }
                      return groupChild
                    })
                  })
                }
                return child
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <button
      type="button"
      ref={ref}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      <span>{children}</span>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder, children }) => {
  return children || <span className="text-gray-400">{placeholder}</span>
}

const SelectContent = ({ children }) => {
  return <>{children}</>
}

const SelectItem = ({ children, value, onSelect, selected, className }) => {
  return (
    <div
      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between ${selected ? 'bg-gray-100 font-medium' : ''} ${className}`}
      onClick={() => onSelect && onSelect(value)}
    >
      <span>{children}</span>
      {selected && <Check className="h-4 w-4 text-gray-600" />}
    </div>
  )
}

const SelectGroup = ({ children, label }) => {
  return (
    <div>
      {label && (
        <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </div>
      )}
      {children}
    </div>
  )
}

const SelectLabel = ({ children }) => {
  return (
    <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {children}
    </div>
  )
}

const SelectSeparator = () => {
  return <div className="h-px bg-gray-200 my-1" />
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
}