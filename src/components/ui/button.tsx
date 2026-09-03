import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_30px_-5px_hsl(195_45%_65%_/_0.3)] hover:shadow-lg",
        destructive: "cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "cursor-pointer border border-border bg-transparent hover:bg-secondary hover:text-secondary-foreground",
        secondary: "cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "cursor-pointer hover:bg-secondary hover:text-secondary-foreground",
        link: "cursor-pointer text-primary underline-offset-4 hover:underline font-bold hover:text-[hsl(210,30%,20%)]",
        celeste: "cursor-pointer bg-gradient-to-r from-[hsl(195,45%,65%)] to-[hsl(195,50%,75%)] text-[hsl(210,30%,20%)] font-semibold shadow-[0_4px_30px_-5px_hsl(195_45%_65%_/_0.3)] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        rojo: "cursor-pointer bg-gradient-to-r from-[hsl(0,75%,70%)] to-[hsl(0,85%,80%)] text-[hsl(0,40%,20%)] font-semibold shadow-[0_4px_30px_-5px_hsl(0_75%_70%_/_0.3)] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        verde: "cursor-pointer bg-gradient-to-r from-[hsl(145,45%,65%)] to-[hsl(145,50%,75%)] text-[hsl(145,40%,20%)] font-semibold shadow-[0_4px_30px_-5px_hsl(145_45%_65%_/_0.3)] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        amarillo: "cursor-pointer bg-gradient-to-r from-[hsl(45,85%,65%)] to-[hsl(50,90%,75%)] text-[hsl(45,60%,15%)] font-semibold shadow-[0_4px_30px_-5px_hsl(45_85%_65%_/_0.3)] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        blanco: "cursor-pointer bg-gradient-to-r from-[hsl(210,20%,95%)] to-[hsl(0,0%,100%)] text-[hsl(210,30%,25%)] font-semibold border border-[hsl(210,20%,90%)] shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        hero: "cursor-pointer bg-gradient-to-r from-[hsl(195,45%,65%)] to-[hsl(195,50%,75%)] text-[hsl(210,30%,20%)] font-semibold text-base px-8 py-6 shadow-[0_4px_30px_-5px_hsl(195_45%_65%_/_0.3)] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        "outline-celeste": "cursor-pointer border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
