#!/usr/bin/env python

from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import os
import sys

#Create custom HTTPRequestHandler class
class KodeFunHTTPRequestHandler(BaseHTTPRequestHandler):
  
  #handle GET command
  def do_GET(self):
    self.send_response(200)
    #send header first
    self.send_header('Content-type','text-html')
    self.end_headers()

    #send file content to client
    self.wfile.write("Hello From Python")
  
def run():
  print('http server is starting...')

  #ip and port of servr
  #by default http server port is 9999
  PORT = 9999
  if len(sys.argv) >= 2:
    PORT = sys.argv[1]

  server_address = ('127.0.0.1', int(PORT))
  httpd = HTTPServer(server_address, KodeFunHTTPRequestHandler)
  print('http server is running...', PORT)
  httpd.serve_forever()
  
if __name__ == '__main__':
  run()