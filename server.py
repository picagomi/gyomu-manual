"""ローカル確認用の簡易サーバー: python3 server.py [port]"""
import os, sys, functools, http.server, socketserver

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8790

Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"serving {ROOT} on http://localhost:{PORT}", flush=True)
    httpd.serve_forever()
