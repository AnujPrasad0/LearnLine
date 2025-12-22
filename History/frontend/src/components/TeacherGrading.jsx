import React, { useState, useEffect } from "react";

const TeacherGrading = () => {
  // Initial Data
  const initialData = {
    markingScheme: {
      segments: [
        {
          teacherSegment:
            "Liberalism stood for freedom for individual and equality of all before law.",
          studentAnswer:
            "Liberalism, stemming from the Latin root 'liber' meaning free, championed freedom for the individual and equality of all befre the law.",
          maxMarks: 1,
          awardedMarks: 1,
        },
        {
          teacherSegment:
            "It emphasised on the concept of government by consent.",
          studentAnswer:
            "Politically, liberalism stressed the concept of government by consent.",
          maxMarks: 1,
          awardedMarks: 1,
        },
        {
          teacherSegment:
            "It stood for the end of autocracy and clerical privileges.",
          studentAnswer:
            "It called for the end of autocracy and clerical prvileges,",
          maxMarks: 1,
          awardedMarks: 1,
        },
        {
          teacherSegment:
            "It believed in a constitution and representative government through Parliament.",
          studentAnswer:
            "advocating for a constitution and representative government through parliament,",
          maxMarks: 1,
          awardedMarks: 1,
        },
        {
          teacherSegment:
            "The coming of the railways further linked harnessing economic interests to national unification as it helped stimulate mobility",
          studentAnswer: "",
          maxMarks: 1,
          awardedMarks: 0,
        },
      ],
      deductions: {
        content: [
          "The student did not mention 'railways' or their role in linking economic interests to national unification and stimulating mobility, which is a specific point in the marking scheme.",
        ],
        spellingMistakes: [
          {
            incorrect: "befre",
            correct: "before",
            reason: "Spelling mistake",
          },
          {
            incorrect: "prvileges",
            correct: "privileges",
            reason: "Spelling mistake",
          },
          {
            incorrect: "midle",
            correct: "middle",
            reason: "Spelling mistake",
          },
        ],
        grammarMistakes: [],
        marksDeducted: 0.5,
      },
      totalMarksAwarded: 3.5,
      maximumMarks: 5,
    },
  };

  const [data, setData] = useState(initialData);

  // Recalculate total whenever segments or deduction marks change
  useEffect(() => {
    const marksFromSegments = data.markingScheme.segments.reduce(
      (acc, curr) => acc + (parseFloat(curr.awardedMarks) || 0),
      0
    );
    const deduction =
      parseFloat(data.markingScheme.deductions.marksDeducted) || 0;
    const newTotal = marksFromSegments - deduction;

    setData((prev) => ({
      ...prev,
      markingScheme: {
        ...prev.markingScheme,
        totalMarksAwarded: Math.max(0, newTotal), // Ensure no negative total
      },
    }));
  }, [
    data.markingScheme.segments,
    data.markingScheme.deductions.marksDeducted,
  ]);

  const handleSegmentMarkChange = (index, newValue) => {
    const updatedSegments = [...data.markingScheme.segments];
    // Allow empty string for typing, otherwise parse float
    updatedSegments[index].awardedMarks =
      newValue === "" ? "" : parseFloat(newValue);

    setData((prev) => ({
      ...prev,
      markingScheme: {
        ...prev.markingScheme,
        segments: updatedSegments,
      },
    }));
  };

  const handleDeductionChange = (newValue) => {
    setData((prev) => ({
      ...prev,
      markingScheme: {
        ...prev.markingScheme,
        deductions: {
          ...prev.markingScheme.deductions,
          marksDeducted: newValue === "" ? "" : parseFloat(newValue),
        },
      },
    }));
  };

  const handleSave = () => {
    console.log("Saved Data:", data);
    alert("Data saved to console!");
  };

  const { markingScheme } = data;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-8 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Grading (Teacher View)
          </h2>
          <p className="text-gray-500 mt-1">
            Edit marks and save the assessment.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
        >
          Save Changes
        </button>
      </div>

      {/* Segments */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-700 px-1">
          Answer Breakdown
        </h3>
        <div className="grid gap-6">
          {markingScheme.segments.map((segment, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {/* Teacher Segment */}
                <div className="p-6 bg-emerald-50/30">
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 tracking-wide">
                      TEACHER EXPECTATION
                    </span>
                    <span className="text-sm font-bold text-emerald-700/70 whitespace-nowrap ml-2">
                      Max: {segment.maxMarks}
                    </span>
                  </div>
                  <p className="text-gray-800 font-medium leading-relaxed">
                    {segment.teacherSegment}
                  </p>
                </div>

                {/* Student Answer */}
                <div className="p-6 bg-white relative">
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 tracking-wide">
                      STUDENT ANSWER
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-500">
                        Awarded:
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={segment.maxMarks}
                        step="0.5"
                        value={segment.awardedMarks}
                        onChange={(e) =>
                          handleSegmentMarkChange(index, e.target.value)
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center font-bold text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {segment.studentAnswer || (
                      <span className="italic text-gray-400">
                        (No answer provided)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deductions & Feedback */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Content Issues */}
        <div className="md:col-span-1 bg-amber-50/50 rounded-xl border border-amber-100 p-6">
          <h4 className="flex items-center gap-2 text-amber-800 font-bold mb-4">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
            Content Deductions
          </h4>
          <div className="flex flex-col gap-3">
            {markingScheme.deductions.content.length > 0 ? (
              markingScheme.deductions.content.map((item, i) => (
                <div
                  key={i}
                  className="text-sm text-amber-900 bg-amber-100/50 p-3 rounded-lg leading-relaxed"
                >
                  {item}
                </div>
              ))
            ) : (
              <div className="text-sm text-amber-700/50 italic">
                No content deductions
              </div>
            )}
          </div>
        </div>

        {/* Spelling & Grammar */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-gray-800 font-bold flex items-center gap-2">
              <svg
                className="w-5 h-5 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                ></path>
              </svg>
              Language Accuracy
            </h4>

            {/* Editable Deduction */}
            <div className="flex items-center gap-2 bg-red-50 p-2 rounded-lg border border-red-100">
              <label className="text-sm font-semibold text-red-700">
                Deductions:
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={markingScheme.deductions.marksDeducted}
                onChange={(e) => handleDeductionChange(e.target.value)}
                className="w-16 px-2 py-1 border border-red-200 rounded text-center text-red-600 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Spelling Table */}
            <div>
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Spelling Errors
              </h5>
              {markingScheme.deductions.spellingMistakes.length > 0 ? (
                <div className="border rounded-lg overflow-hidden border-gray-100">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500">
                      <tr>
                        <th className="px-3 py-2 font-medium">Incorrect</th>
                        <th className="px-3 py-2 font-medium">Correct</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {markingScheme.deductions.spellingMistakes.map(
                        (mistake, i) => (
                          <tr key={i} className="bg-white">
                            <td className="px-3 py-2 text-red-500 line-through decoration-red-300">
                              {mistake.incorrect}
                            </td>
                            <td className="px-3 py-2 text-emerald-600 font-medium">
                              {mistake.correct}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No spelling mistakes found.
                </p>
              )}
            </div>

            {/* Grammar */}
            <div>
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Grammar Errors
              </h5>
              {markingScheme.deductions.grammarMistakes.length > 0 ? (
                <ul className="space-y-2">
                  {markingScheme.deductions.grammarMistakes.map(
                    (mistake, i) => (
                      <li
                        key={i}
                        className="text-sm p-2 bg-red-50 text-red-700 rounded border border-red-100"
                      >
                        {mistake}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No grammar mistakes found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Final Score (Bottom) */}
      <div className="bg-gray-900 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center text-white shadow-xl mt-8 sticky bottom-4 z-10">
        <div>
          <h3 className="text-xl font-bold mb-1">Final Result</h3>
          <p className="text-gray-400 text-sm">
            Total marks awarded after all deductions (Auto-calculated)
          </p>
        </div>
        <div className="flex items-baseline gap-2 mt-4 md:mt-0">
          <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            {markingScheme.totalMarksAwarded}
          </span>
          <span className="text-2xl font-semibold text-gray-500">
            / {markingScheme.maximumMarks}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TeacherGrading;
