const RESUME_ACK_KEY = "spliteasy.resume.ack";

/** Whether this tab session has already answered the "Resume your previous bill?" prompt. */
export function resumePromptAcknowledged(): boolean {
  try {
    return sessionStorage.getItem(RESUME_ACK_KEY) === "1";
  } catch {
    return false;
  }
}

/** Marks the prompt as answered, e.g. before a reload that would otherwise re-ask. */
export function acknowledgeResumePrompt() {
  try {
    sessionStorage.setItem(RESUME_ACK_KEY, "1");
  } catch {
    // Storage blocked (private mode): the prompt may reappear, which is safe now that dismissing it resumes.
  }
}
