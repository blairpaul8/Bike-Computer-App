# --- Git branch function ---
parse_git_branch() {
    local branch
    branch=$(git branch 2>/dev/null | sed -n '/\* /s///p')
    if [ -n "$branch" ]; then
        printf ' (%s)' "$branch"
    fi
}

# --- Color definitions ---
RESET='\[\033[00m\]'
GREEN='\[\033[01;32m\]'
BLUE='\[\033[01;34m\]'
YELLOW='\[\033[01;33m\]'

# --- Prompt: user@host:path (branch) $ ---
PS1="${GREEN}\u@\h${RESET}:${BLUE}\w${RESET}${YELLOW}\$(parse_git_branch)${RESET}\$ "

# --- Add IDF.py to workspace---
export IDF_PATH=/opt/esp/esp-idf

# --- Run export.sh after openning termial to have access to idf.py ---
if [ -f "$IDF_PATH/export.sh" ]; then
    source "$IDF_PATH/export.sh"
fi
