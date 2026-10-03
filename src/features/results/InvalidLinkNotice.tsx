import { Button } from "../../components/ui/Button";
import { AlertIcon } from "../../components/ui/icons";

export function InvalidLinkNotice() {
  function startNew() {
    history.replaceState(null, "", window.location.pathname + window.location.search);
    window.location.reload();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <AlertIcon width={32} height={32} className="text-danger" />
      <h1 className="font-display text-xl font-semibold text-ink">This link is invalid or from a newer version.</h1>
      <p className="text-sm text-ink-soft">
        This shared bill couldn't be read. The link may be incomplete, or it was made with a newer version of SplitEasy.
      </p>
      <Button onClick={startNew}>Start a new bill</Button>
    </div>
  );
}
