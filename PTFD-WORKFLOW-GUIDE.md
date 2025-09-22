# PTFD-Only Workflow Guide

This guide ensures that you only commit changes to your PTFD directory without affecting other team members' work.

## Best Practices

1. **Always work only in the PTFD directory**
2. **Never modify files outside of PTFD/**
3. **Regularly check your changes before committing**

## Commands for PTFD-Only Workflow

### Check your current changes:
```bash
git status PTFD/
```

### Add only PTFD changes:
```bash
git add PTFD/
```

### Commit only PTFD changes:
```bash
git commit -m "Your descriptive commit message about PTFD changes"
```

### Push your changes:
```bash
git push origin main
```

## Using the Helper Script

You can also use the provided script to simplify the process:

```bash
./ptfd-commit.sh "Your descriptive commit message"
```

Then push with:
```bash
git push origin main
```

## What to Avoid

1. **Don't use**: `git add .` (adds everything)
2. **Don't use**: `git commit -a` (commits all tracked files)
3. **Don't modify**: Files in CIM/, ETM/, MISTM/, or WSPM/ directories
4. **Don't commit**: Root level files that don't belong to PTFD

## Conflict Prevention

1. **Before pulling changes**: Always commit your local changes first
2. **When pulling updates**: Use `git pull --ff-only` to avoid merge conflicts
3. **If conflicts occur**: Contact your team members to coordinate

## Verifying Your Changes

To see what files you've modified in PTFD:
```bash
git diff --name-only HEAD PTFD/
```

To see the actual changes:
```bash
git diff PTFD/
```