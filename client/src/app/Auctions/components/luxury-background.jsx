export function LuxuryBackground() {
    return (
        <div className="fixed inset-0  -z-10 h-full w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-luxury-pearl via-white to-luxury-cream opacity-60" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px)] bg-[size:40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>
    )
}

