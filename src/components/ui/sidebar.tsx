
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet" // Added SheetTitle
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem" // Default width for expanded sidebar
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3.5rem" // Width for icon-only collapsed sidebar (e.g., 56px for h-14 items + padding)
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
  collapsibleVariant: "offcanvas" | "icon" | "none"
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)
    // This internal state is for desktop sidebar.
    const [_open, _setOpen] = React.useState(defaultOpen)
    const open = openProp ?? _open
    
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }
        if (typeof document !== 'undefined') {
          document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
        }
      },
      [setOpenProp, open]
    )

    // Read cookie on mount
    React.useEffect(() => {
      if (typeof document !== 'undefined') {
        const cookieValue = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
          ?.split('=')[1];
        if (cookieValue !== undefined) {
          setOpen(cookieValue === 'true');
        }
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty array ensures this runs only once on mount


    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((current) => !current)
        : setOpen((current) => !current)
    }, [isMobile, setOpen, setOpenMobile])

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }
      if (typeof window !== 'undefined') {
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
      }
    }, [toggleSidebar])

    const state = open ? "expanded" : "collapsed"
    // This context value needs to be stable or memoized.
    // The `collapsibleVariant` will be provided by the Sidebar component itself.
    // For now, we'll add a placeholder and refine if Sidebar directly provides it.
    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
        collapsibleVariant: "icon", // Default or placeholder
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            data-testid="sidebar-provider"
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full",
              className
            )}
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(
  (
    {
      side = "left",
      variant = "sidebar", 
      collapsible = "icon", 
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile, setOpen } = useSidebar();
    
    const currentCollapsible = isMobile ? "offcanvas" : collapsible;


    React.useEffect(() => {
        if (isMobile && state === "collapsed") {
            // Mobile specific logic can go here if needed
        } else if (!isMobile && openMobile) {
            setOpen(true); 
            setOpenMobile(false);
        }
    }, [isMobile, state, openMobile, setOpen, setOpenMobile]);


    if (collapsible === "none" && !isMobile) {
      return (
        <div
          data-sidebar="sidebar"
          className={cn(
            "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
            side === "left" ? "border-r border-sidebar-border" : "border-l border-sidebar-border",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }
    
    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className={cn(
                "w-[--sidebar-width-mobile] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden",
                className
                )}
            style={
              {
              } as React.CSSProperties
            }
            side={side}
          >
            <SheetTitle className="sr-only">Main Menu</SheetTitle>
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <aside
        ref={ref}
        data-sidebar="sidebar"
        className={cn(
            "group hidden md:flex md:flex-col transition-all duration-300 ease-in-out text-sidebar-foreground bg-sidebar", 
            side === "left" ? "border-r border-sidebar-border" : "border-l border-sidebar-border",
            state === "expanded" ? "w-[--sidebar-width]" : "w-[--sidebar-width-icon]",
            currentCollapsible === "offcanvas" && state === "collapsed" ? (side === "left" ? "-ml-[--sidebar-width]" : "-mr-[--sidebar-width]") : "",
            currentCollapsible === "offcanvas" && state === "expanded" ? "shadow-lg" : "",
            className
        )}
        data-state={state}
        data-collapsible-variant={currentCollapsible} 
        {...props}
      >
        {children}
      </aside>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, children, asChild, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      asChild={asChild}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {children || <PanelLeft />}
          <span className="sr-only">Toggle Sidebar</span>
        </>
      )}
    </Button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger"


const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  // const { state, isMobile } = useSidebar(); // state and isMobile are not directly used for styling SidebarInset itself
  return (
    <main
      ref={ref}
      className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  const { state } = useSidebar();
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        "h-9 w-full bg-sidebar-accent shadow-none focus-visible:ring-1 focus-visible:ring-ring",
        state === "collapsed" ? "hidden" : "block",
        className
      )}
      {...props}
    />
  )
})
SidebarInput.displayName = "SidebarInput"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-3 border-b border-sidebar-border", className)} 
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-3 border-t border-sidebar-border mt-auto", className)} 
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-2 my-1 w-auto bg-sidebar-border group-data-[state=collapsed]/sidebar-wrapper:group-data-[collapsible-variant=icon]:mx-auto group-data-[state=collapsed]/sidebar-wrapper:group-data-[collapsible-variant=icon]:my-2", className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex-1 min-h-0 overflow-y-auto overflow-x-hidden", 
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("flex w-full min-w-0 flex-col p-2 group-data-[state=collapsed]/sidebar-wrapper:group-data-[collapsible-variant=icon]:p-1", className)}
      {...props}
    />
  )
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"
  const { state } = useSidebar();

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none focus-visible:ring-2 focus-visible:ring-ring",
        state === "collapsed" ? "hidden" : "flex",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"


const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-0.5", className)} 
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2.5 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-ring transition-all duration-200 ease-in-out hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-1 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:font-medium",
  {
    variants: {
      variant: {
        default: "", 
      },
      size: {
        default: "h-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement, 
  React.ComponentProps<"button"> & { 
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent> | { content: React.ReactNode; side?: "top" | "right" | "bottom" | "left"; align?: "start" | "center" | "end"; }
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button" 
    const { state, isMobile } = useSidebar();

    const buttonContent = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(
            sidebarMenuButtonVariants({ variant, size, className }),
            state === "collapsed" && "justify-center px-0 w-10 h-10" 
        )}
        {...props}
      >
        {children}
      </Comp>
    );
    
    if (!tooltip || (state === "expanded" && !isMobile)) {
      return buttonContent;
    }

    let tooltipProps: React.ComponentProps<typeof TooltipContent> = { side: "right", align: "center" };
    let tooltipNode: React.ReactNode = null;

    if (typeof tooltip === 'string') {
      tooltipNode = tooltip;
    } else if (React.isValidElement(tooltip)) { 
        tooltipNode = tooltip; 
    } else if (tooltip && 'content' in tooltip) { 
        tooltipNode = tooltip.content;
        if (tooltip.side) tooltipProps.side = tooltip.side;
        if (tooltip.align) tooltipProps.align = tooltip.align;
    }


    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent {...tooltipProps}>
          {tooltipNode}
        </TooltipContent>
      </Tooltip>
    );
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}

