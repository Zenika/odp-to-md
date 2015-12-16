#!/bin/bash
# version 2.0.0

## Create script for move all unused images
cat > isolateUnusedImages.sh <<EOF
#!/bin/bash
mkdir backup
EOF
chmod 754 isolateUnusedImages.sh

## Browse all images
for f in `ls images`
do
  ## Find images in MD files in parent folder
  grep -q $f ../*.md
  if [ $? -gt 0 ]
  then
    ## add one line by unused image
    echo "mv \"images/$f\" \"backup/$f\"" >> isolateUnusedImages.sh
  fi
done
