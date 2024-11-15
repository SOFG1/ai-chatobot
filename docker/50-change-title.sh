#!/bin/sh

# Function to handle errors
handle_error() {
    echo "Error occurred while replacing title in $1"
}

# Replace title
sed -i "s#<title>.*</title>#<title>${VITE_APP_TITLE}</title>#" /usr/share/nginx/html/index.html

# Check if the sed command was successful
if [ $? -ne 0 ]; then
    handle_error "/usr/share/nginx/html/index.html"
fi