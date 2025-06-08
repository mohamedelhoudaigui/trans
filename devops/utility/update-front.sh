# if frontend exists remove it.
# if

# Ensure you're on the dev branch
git checkout dev

# Create the frontend directory
mkdir frontend

# Export mboukaiz files to frontend/
git archive origin/mboukaiz | tar -x -C frontend

git add frontend/

git commit -m "Updated frontend/"

# Push to remote dev branch
git push origin dev
