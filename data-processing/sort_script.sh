#!/bin/bash

# Check if the correct number of arguments is provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 input_file output_file"
    exit 1
fi

input_file="$1"
output_file="$2"

# Rest of your script remains the same
sort --parallel=$(nproc) -t$',' -k1,1n -o "$output_file" "$input_file"

echo "File sorted and saved to $output_file"