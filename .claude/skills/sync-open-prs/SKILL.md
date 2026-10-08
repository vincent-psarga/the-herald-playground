---
name: sync-open-prs
description: Merge main into every open pull request's branch, push them, then merge all of them into feat/support-all-grammar and push that too. Run only when the user invokes /sync-open-prs.
disable-model-invocation: true
---

# Syncing the open pull requests with main

Run this only when the user has typed `/sync-open-prs`. Never start it on your own
initiative, and never because a task "would benefit" from fresh branches.

Invoking it is the user's explicit permission for what the git workflow in
`CLAUDE.md` otherwise forbids: checking out other branches and **pushing** them.
That permission covers the branches named below and nothing else. Still never
force-push, never open, close or merge a pull request on GitHub, and never push
`main`.

## Leave the user's checkout alone

Do the work in throwaway worktrees under the scratchpad, so the branch and any
uncommitted changes in the main checkout are untouched:

```
git fetch origin --prune
git worktree add <scratchpad>/sync/<branch> <branch>
```

Remove each worktree with `git worktree remove` once its branch is pushed or
handed back to the user.

## 1. List the open pull requests

```
gh pr list --state open --json number,title,headRefName,baseRefName,isCrossRepository
```

Keep the PRs whose base is `main` and that are not from a fork. Leave
`feat/support-all-grammar` out of this list even if it has a PR of its own: it is
handled in step 3.

## 2. Merge main into each branch

For every branch, in PR-number order:

1. **Bring it up to date.** Create the local branch from `origin/<branch>` if it
   does not exist. If it does, fast-forward it to `origin/<branch>`. If the local
   branch has commits the remote lacks, or the two have diverged, stop on that
   branch and ask the user — those commits are theirs.
2. **Merge.** `git merge origin/main --no-edit`.
3. **No conflicts → push.** `git push origin <branch>`. No need to run anything first.
4. **Conflicts → resolve, then judge the risk** (see below). Low risk: commit the
   merge and push. Otherwise: leave the branch unpushed and ask the user.

Carry on with the next branch while one waits for the user; ask about all the
waiting ones together, not one at a time.

## 3. Merge every PR into feat/support-all-grammar

This branch shows the app with all open PRs together.

1. Bring `feat/support-all-grammar` up to date as in step 2.1.
2. Merge `origin/main` into it.
3. Merge each PR branch from step 2 into it, in PR-number order, using the local
   branch so this run's merges come along. A branch the user has not yet approved
   in step 2 is skipped and named in the report.
4. Resolve conflicts and judge the risk as for any branch. Push once, after the
   last merge, if every resolution was low risk; otherwise ask before pushing.

## Resolving a conflict and judging the risk

Read both sides and the commits that produced them (`git log --merge -p <file>`)
before touching the file. Keep the intent of both: a conflict is almost never
"pick one side".

Then run, in the worktree (`npm ci` first if `node_modules` is missing):

```
npm run typecheck && npm test && npm run build
```

The risk is **low** only when all of these hold:

- the checks above pass;
- every conflict was mechanical — imports, neighbouring additions to the same
  list, enum or `RULES` array, formatting, lockfile, generated output;
- no resolution required choosing between two different behaviours.

It is **not low** when a check fails, when both sides changed the same logic
(parser rules, the writer, the domain model, a translation's spelling), when you
had to write new code to make the sides fit, or when you are unsure. Then commit
nothing to the remote: describe each conflict, the resolution you propose, and
why it is risky, and wait for the user.

## Report

End with a table: each branch, whether it merged cleanly, had conflicts resolved
at low risk, or is waiting for the user, and whether it was pushed. List the
files whose conflicts you resolved, so the user can look at them.
