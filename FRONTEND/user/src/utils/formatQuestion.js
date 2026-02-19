export function formatQuestion(question, index = 0) {
  if (!question || !question.title) {
    return {
      questionPart: "⚠ Question data missing",
      codePart: "",
      language: "text",
      isInvalid: true,
    };
  }

  return {
    // Add question number here
    questionPart: `Q${index + 1}. ${question.title}`,
    codePart: question.code?.content || "",
    language: question.code?.language || "text",
    isInvalid: question.type === "output" && !question.code?.content,
  };
}
