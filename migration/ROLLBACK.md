# Baseline and rollback

Recorded remote main: `0feac3f8376c5110eedfc20f5cdeecd0494f1ed7`.
Local annotated tag: `site-v2-baseline-20260912`.
Verified full-history bundle: `../site-v2-backup/site-v2-baseline.bundle` (outside the public repository).
Original checkout branch: `feature/arc-forge-origin-page`; it had no tracked changes.

No live changes occur in Slices 0–4, so live rollback is unnecessary. To inspect the preserved site without overwriting work:

```sh
git worktree add --detach ../site-v2-rollback site-v2-baseline-20260912
```

If the repository is unavailable, recover into a new directory:

```sh
git clone ../site-v2-backup/site-v2-baseline.bundle ../site-v2-recovered
git -C ../site-v2-recovered switch --detach 0feac3f8376c5110eedfc20f5cdeecd0494f1ed7
```

Do not reset main, force-push, change CNAME, or alter DNS. A future production rollback must be specified and approved with the final go-live plan. The tag and bundle are local until explicitly pushed as part of branch checkpoint publication.
