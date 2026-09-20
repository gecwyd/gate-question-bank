import re

with open('src/app/page.tsx', 'r') as f:
    code = f.read()

# We need to replace everything from `{/* Questions List */}` down to just before `{/* Pagination */}`
start_idx = code.find('{/* Questions List */}')
end_idx = code.find('{/* Pagination */}', start_idx)

if start_idx != -1 and end_idx != -1:
    replacement = """{/* Focus View */}
            {focusIndex !== null && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm mb-6">
                  <Button variant="ghost" onClick={() => setFocusIndex(null)} className="h-10 px-4 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                  </Button>
                  <div className="text-sm font-semibold text-slate-500">
                    Question {focusIndex + 1} of {filtered.length}
                  </div>
                </div>

                <QuestionCard
                  q={filtered[focusIndex]}
                  absoluteIndex={focusIndex}
                  answerOpen={revealed.has(focusIndex)}
                  onToggleAnswer={() => {
                    setRevealed(old => {
                      const next = new Set(old);
                      next.has(focusIndex) ? next.delete(focusIndex) : next.add(focusIndex);
                      return next;
                    });
                  }}
                  remoteImage={remoteImage}
                  onFocus={() => setFocusIndex(null)}
                  isFocused={true}
                />

                <div className="flex items-center justify-between mt-10 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFocusIndex(prev => prev !== null ? Math.max(0, prev - 1) : null);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    disabled={focusIndex === 0}
                    className="rounded-xl h-11 px-6"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={() => {
                      setFocusIndex(prev => prev !== null ? Math.min(filtered.length - 1, prev + 1) : null);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    disabled={focusIndex === filtered.length - 1}
                    className="rounded-xl h-11 px-6"
                  >
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Questions List */}
            {focusIndex === null && (
              <div className="space-y-6">
                {shown.map((q, index) => {
                  const absoluteIndex = (page - 1) * PAGE_SIZE + index;
                  const answerOpen = revealed.has(absoluteIndex);
                  
                  return (
                    <QuestionCard
                      key={`${q.question_number}-${absoluteIndex}`}
                      q={q}
                      absoluteIndex={absoluteIndex}
                      answerOpen={answerOpen}
                      onToggleAnswer={() => {
                        setRevealed(old => {
                          const next = new Set(old);
                          answerOpen ? next.delete(absoluteIndex) : next.add(absoluteIndex);
                          return next;
                        });
                      }}
                      remoteImage={remoteImage}
                      onFocus={() => {
                        setFocusIndex(absoluteIndex);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  );
                })}

                {!shown.length && (
                  <div className="py-20 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl border-dashed">
                    <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">No questions found</h3>
                    <p className="text-slate-500">Adjust your search or topic filter to see more results.</p>
                  </div>
                )}
              </div>
            )}
            
            """
    
    code = code[:start_idx] + replacement + code[end_idx:]
    with open('src/app/page.tsx', 'w') as f:
        f.write(code)
else:
    print("Could not find start or end index")

