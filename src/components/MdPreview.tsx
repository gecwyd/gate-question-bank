import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

export default function MdPreview({ value, className, minimal }: { value: string, className?: string, minimal?: boolean }) {
    if (minimal) {
        return (
            <span className={cn("text-foreground text-sm inline", className)}>
                <ReactMarkdown
                    children={value}
                    remarkPlugins={[remarkMath, remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeKatex]}
                    components={{
                        h1: ({ children }) => <span className="font-semibold">{children} </span>,
                        h2: ({ children }) => <span className="font-semibold">{children} </span>,
                        h3: ({ children }) => <span className="font-semibold">{children} </span>,
                        h4: ({ children }) => <span className="font-semibold">{children} </span>,
                        h5: ({ children }) => <span className="font-semibold">{children} </span>,
                        h6: ({ children }) => <span className="font-semibold">{children} </span>,
                        p: ({ children }) => <span>{children} </span>,
                        a: ({ children }) => <span className="text-primary">{children}</span>,
                        strong: ({ children }) => <strong>{children}</strong>,
                        em: ({ children }) => <em>{children}</em>,
                        ul: ({ children }) => <span>{children}</span>,
                        ol: ({ children }) => <span>{children}</span>,
                        li: ({ children }) => <span>• {children} </span>,
                        blockquote: ({ children }) => <span className="text-muted-foreground italic">{children}</span>,
                        code: ({ children }) => <code className="bg-muted px-1 rounded text-xs">{children}</code>,
                        pre: ({ children }) => <span>{children}</span>,
                        img: () => <span className="text-muted-foreground">[image]</span>,
                        video: () => <span className="text-muted-foreground">[video]</span>,
                        iframe: () => <span className="text-muted-foreground">[embed]</span>,
                        hr: () => <span> — </span>,
                        br: () => <span> </span>,
                        table: () => <span className="text-muted-foreground">[table]</span>,
                        thead: () => null,
                        tbody: () => null,
                        tr: () => null,
                        th: () => null,
                        td: () => null,
                    }}
                />
            </span>
        );
    }

    return (
        <div className={cn("text-foreground", className)}>
            <ReactMarkdown
                children={value}
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
                components={{
                    h1: ({ className, ...props }) => (
                        <h1
                            className={cn(
                                "scroll-m-20 text-3xl sm:text-4xl font-extrabold tracking-tight mb-4",
                                className
                            )}
                            {...props}
                        />
                    ),
                    h2: ({ className, ...props }) => (
                        <h2
                            className={cn(
                                "scroll-m-20 border-b border-border pb-2 text-2xl font-semibold tracking-tight first:mt-0 mb-4 mt-8",
                                className
                            )}
                            {...props}
                        />
                    ),
                    h3: ({ className, ...props }) => (
                        <h3
                            className={cn(
                                "scroll-m-20 text-xl font-semibold tracking-tight mb-3 mt-6",
                                className
                            )}
                            {...props}
                        />
                    ),
                    h4: ({ className, ...props }) => (
                        <h4
                            className={cn(
                                "scroll-m-20 text-lg font-semibold tracking-tight mb-2 mt-4",
                                className
                            )}
                            {...props}
                        />
                    ),
                    p: ({ className, ...props }) => (
                        <div
                            className={cn("leading-7 [&:not(:first-child)]:mt-4", className)}
                            {...props}
                        />
                    ),
                    a: ({ className, ...props }) => (
                        <a
                            className={cn("font-medium text-primary underline underline-offset-4", className)}
                            {...props}
                        />
                    ),
                    blockquote: ({ className, ...props }) => (
                        <blockquote
                            className={cn("mt-4 border-l-2 border-primary/50 pl-4 italic text-muted-foreground", className)}
                            {...props}
                        />
                    ),
                    ul: ({ className, ...props }) => (
                        <ul className={cn("my-4 ml-6 list-disc [&>li]:mt-1.5", className)} {...props} />
                    ),
                    ol: ({ className, ...props }) => (
                        <ol className={cn("my-4 ml-6 list-decimal [&>li]:mt-1.5", className)} {...props} />
                    ),
                    hr: ({ ...props }) => <hr className="my-6 border-border" {...props} />,
                    table: ({ className, ...props }) => (
                        <div className="my-6 w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
                            <table className={cn("w-full border-collapse caption-bottom text-sm", className)} {...props} />
                        </div>
                    ),
                    thead: ({ className, ...props }) => (
                        <thead className={cn("bg-muted/60 border-b border-border text-foreground font-semibold", className)} {...props} />
                    ),
                    tbody: ({ className, ...props }) => (
                        <tbody className={cn("[&_tr:last-child]:border-0 divide-y divide-border", className)} {...props} />
                    ),
                    tr: ({ className, ...props }) => (
                        <tr
                            className={cn("m-0 border-b border-border transition-colors hover:bg-muted/40", className)}
                            {...props}
                        />
                    ),
                    th: ({ className, ...props }) => (
                        <th
                            className={cn(
                                "h-10 px-4 py-2.5 text-left align-middle font-bold text-foreground border-r border-border last:border-r-0 [&[align=center]]:text-center [&[align=right]]:text-right",
                                className
                            )}
                            {...props}
                        />
                    ),
                    td: ({ className, ...props }) => (
                        <td
                            className={cn(
                                "p-3 align-middle border-r border-border last:border-r-0 [&[align=center]]:text-center [&[align=right]]:text-right text-foreground font-medium",
                                className
                            )}
                            {...props}
                        />
                    ),
                    pre: ({ className, ...props }) => (
                        <pre
                            className={cn(
                                "mb-4 mt-4 overflow-x-auto rounded-xl border border-border bg-muted/50 p-4 font-mono text-sm text-foreground",
                                className
                            )}
                            {...props}
                        />
                    ),
                    code: ({ className, ...props }) => (
                        <code
                            className={cn(
                                "relative rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm font-semibold text-foreground",
                                className
                            )}
                            {...props}
                        />
                    ),
                }}
            />
        </div>
    );
}
