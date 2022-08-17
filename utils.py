import io
import os
import sys
import time
import shutil
import tarfile
import urllib.request

# For progressbar
def report(url):
    file_name = url.split("/")[-1]
    def progbar(blocknr, blocksize, size):
        current = blocknr*blocksize
        sys.stdout.write(f"\rDownloading {file_name} ...... {100.0*current/size:.2f}%")
    return progbar

def download_file(url, file_name, dst):
    file_path = os.path.join(dst, file_name)
    # Data Download
    if not os.path.exists(file_path):
        print("In progress to download data ....")
        urllib.request.urlretrieve(url, file_path, report(url))
        print()
    else:
        print("Already downloaded !")
    return file_path