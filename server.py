# -*- coding: utf-8 -*-
"""Python 模块字典 - 本地服务版

用法:
    python server.py            # 默认 http://127.0.0.1:8000
    python server.py 8080       # 指定端口

用浏览器打开提示的地址后，字典里的「编辑 / 新增条目 / 笔记 / 收藏」会直接
保存到本目录的 pmd_overrides.json —— 跨浏览器共享、清缓存也不丢。
只在本机使用，请勿把端口暴露到公网。
"""
import json
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
ROOT = os.path.dirname(os.path.abspath(__file__))
OVERRIDE = os.path.join(ROOT, 'pmd_overrides.json')


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kw):
        super().__init__(*args, directory=ROOT, **kw)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')   # 数据/页面改动立即可见
        super().end_headers()

    def do_POST(self):
        if self.path != '/api/save':
            self.send_error(404)
            return
        n = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(n)
        try:
            json.loads(body)                             # 校验是合法 JSON
            with open(OVERRIDE, 'wb') as f:
                f.write(body)
            self._json({'ok': True})
        except Exception as e:
            self._json({'ok': False, 'error': str(e)})

    def _json(self, obj):
        b = json.dumps(obj).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def log_message(self, fmt, *args):
        pass                                             # 静默访问日志


def main():
    os.chdir(ROOT)
    url = f'http://127.0.0.1:{PORT}/'
    print(f'Python 模块字典: {url}   (Ctrl+C 退出)')
    print('编辑/新增/笔记会保存到 pmd_overrides.json')
    try:
        ThreadingHTTPServer(('127.0.0.1', PORT), Handler).serve_forever()
    except KeyboardInterrupt:
        print('\n已退出')


if __name__ == '__main__':
    main()
