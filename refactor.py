import re

with open('src/app/page.tsx', 'r') as f:
    code = f.read()

# 1. Insert QuestionCard component and imports
if 'Maximize2' not in code:
    code = code.replace('import { Search, Loader2', 'import { Search, Loader2, Maximize2, Minimize2, ArrowLeft, ArrowRight')

# We need to find `const PAGE_SIZE = 10;` to insert QuestionCard right after it
insert_idx = code.find('const PAGE_SIZE = 10;')
if insert_idx != -1:
    end_of_line = code.find('\n', insert_idx) + 1
    
    question_card = """
function QuestionCard({
  q,
  absoluteIndex,
  answerOpen,
  onToggleAnswer,
  remoteImage,
  onFocus,
  isFocused
}: {
  q: Question;
  absoluteIndex: number;
  answerOpen: boolean;
  onToggleAnswer: () => void;
  remoteImage: (img: string) => string | null;
  onFocus?: () => void;
  isFocused?: boolean;
}) {
  const images = (q.images ?? []).map(remoteImage).filter((image): image is string => Boolean(image));

  return (
    <Collapsible
      open={answerOpen}
      onOpenChange={onToggleAnswer}
      className={cn(
        "group bg-white dark:bg-slate-900 border rounded-2xl shadow-sm transition-all duration-300 overflow-hidden",
        answerOpen ? "border-primary/30 ring-4 ring-primary/5 shadow-md" : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md",
        isFocused && "border-primary/40 ring-4 ring-primary/10 shadow-lg"
      )}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-800/60">
          <Badge variant="secondary" className="rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Question {q.question_number ?? `${absoluteIndex + 1}`}
          </Badge>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-md font-medium text-slate-500 border-slate-200 dark:border-slate-800">
              {q.topic_name ?? "General"}
            </Badge>
            <Badge variant="outline" className={cn("rounded-md font-bold", q.marks === 1 ? "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50" : "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/50")}>
              {q.marks ?? 1} Mark{q.marks === 1 ? "" : "s"}
            </Badge>
            {onFocus && (
              <button onClick={onFocus} className="ml-2 p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title={isFocused ? "Exit focus" : "Focus question"}>
                {isFocused ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        <div className="text-base font-medium text-slate-800 dark:text-slate-200 leading-relaxed break-words mb-6">
          <MdPreview value={q.question ?? ""} />
        </div>

        {images.length > 0 && (
          <div className="mb-6 space-y-4">
            {images.map((image, imageIndex) => (
              <img key={imageIndex} src={image} alt={`Diagram ${q.question_number}`} className="max-w-full md:max-w-2xl h-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mx-auto" />
            ))}
          </div>
        )}
        
        {q.choices && q.choices.length > 0 && (
          <div className="grid gap-3 mb-6">
            {q.choices.map((choice, choiceIndex) => (
              <div key={choiceIndex} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 shadow-sm mt-0.5">
                  {String.fromCharCode(65 + choiceIndex)}
                </span>
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed w-full">
                  <MdPreview value={choice} minimal />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <CollapsibleTrigger className={cn(buttonVariants({ variant: answerOpen ? "secondary" : "default" }), "h-10 rounded-xl px-6 font-semibold transition-all w-full sm:w-auto")}>
            {answerOpen ? "Hide Solution" : "Reveal Solution"}
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent className="animate-in slide-in-from-top-1 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-1 data-[state=closed]:fade-out data-[state=open]:fade-in duration-200">
        <div className="bg-slate-50 dark:bg-slate-950/50 p-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Correct Answer</p>
              </div>
              <p className="font-bold text-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 inline-block px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                <MdPreview value={(q.answers ?? []).join(", ") || "Not specified"} minimal />
              </p>
            </div>
            
            {q.explanation && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Explanation</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                  <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <MdPreview value={q.explanation ?? ""} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
"""
    code = code[:end_of_line] + "\n" + question_card + "\n" + code[end_of_line:]

# 2. Add focusIndex state
state_insert_idx = code.find('const [error, setError]')
if state_insert_idx != -1:
    end_of_line = code.find('\n', state_insert_idx) + 1
    code = code[:end_of_line] + '  const [focusIndex, setFocusIndex] = useState<number | null>(null);\n' + code[end_of_line:]

# 3. Add keyboard shortcuts
effect_code = """
  useEffect(() => {
    if (focusIndex === null) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setFocusIndex(prev => prev !== null ? Math.max(0, prev - 1) : null);
      } else if (e.key === 'ArrowRight') {
        setFocusIndex(prev => prev !== null ? Math.min(filtered.length - 1, prev + 1) : null);
      } else if (e.key === 'Escape') {
        setFocusIndex(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusIndex, filtered.length]);
"""
# insert before useEffect(() => { list()...
list_effect_idx = code.find('useEffect(() => {\n    setLoading(true);')
if list_effect_idx != -1:
    code = code[:list_effect_idx] + effect_code + '\n  ' + code[list_effect_idx:]

with open('src/app/page.tsx', 'w') as f:
    f.write(code)

