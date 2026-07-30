export const pageVariants = {
    initial: {
        opacity: 0,
        y: 15,
        scale: 0.98,
        filter: "blur(10px)"
    },
    enter: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: {
            duration: 0.4,
            ease: [0.25, 1, 0.5, 1], // easeOutQuart
            staggerChildren: 0.1
        }
    },
    exit: {
        opacity: 0,
        scale: 0.98,
        y: -10,
        filter: "blur(5px)",
        transition: {
            duration: 0.25,
            ease: [0.5, 0, 0.75, 0] // easeInQuart
        }
    }
};

export const itemVariants = {
    initial: { opacity: 0, y: 20 },
    enter: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    }
};

export const hoverVariants = {
    hover: {
        scale: 1.02,
        y: -2,
        transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: {
        scale: 0.98
    }
};
