/* pytest：Python 测试框架事实标准 */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'pytest', name: 'pytest', icon: '⚗️', category: '自动化与效率',
  doc: 'https://docs.pytest.org/',
  desc: '写完的函数到底对不对？写几条断言让机器替你回归。文件放 test_*.py，命令行敲 pytest 就跑。',
  install: 'pip install pytest',
  aliases: ['测试', '单测', 'unit test', '断言'],
  tips: [
    '最小起步：新建 test_calc.py，写一个 test_ 开头的函数 + assert，终端敲 <b>pytest</b> 完事——没有类、没有模板。',
    '发现 bug 先写一条能复现的测试再修，修完测试变绿——这个习惯比任何工具都保值。',
  ],
  entries: [
    {
      name: 'assert-基础', sig: "def test_名字(): assert 表达式 / pytest test_calc.py::test_名字",
      brief: '最小测试：test_ 前缀函数 + assert 断言，命令行直接跑。',
      examples: [
        { title: 'test_calc.py', code: `from calc import add, divide\n\ndef test_add():\n    assert add(2, 3) == 5\n\ndef test_add_negative():\n    assert add(-1, 1) == 0\n\ndef test_divide_by_zero():\n    import pytest\n    with pytest.raises(ZeroDivisionError):   # 断言"应该抛这个错"\n        divide(1, 0)` },
        { title: '命令行', code: `pytest                    # 找当前目录所有 test_*.py / *_test.py\npytest test_calc.py -v    # 只跑这个文件, 显示每条用例名\npytest -k "add and not negative"     # 按名字过滤\npytest -x                 # 第一条失败就停\npytest --lf               # 只重跑上次失败的` },
      ],
      pitfalls: [
        '测试文件和函数必须 <b>test_ 开头</b>（或 *_test 后缀），否则 pytest 根本不收集——"我的测试没被跑"九成是这个。',
        'assert 失败时 pytest 会自动打印出两边的值，不需要自己拼 print。',
        '断言浮点数用 <b>approx</b>：<code>assert result == pytest.approx(0.3)</code>，直接 == 0.3 会因精度翻车。',
      ],
      related: ['fixture', '参数化'],
      tags: ['测试', 'assert', 'raises'],
    },
    {
      name: 'fixture', sig: '@pytest.fixture / def test_x(数据名)  # 参数名=fixture 名自动注入',
      brief: '公共测试数据/环境：准备一次，多个测试共用。',
      examples: [
        { title: '', code: `import pytest\nimport pandas as pd\n\n@pytest.fixture\ndef sample_df():                      # 准备一张公共测试表\n    return pd.DataFrame({\n        '样品': ['S1', 'S2', 'S3'],\n        '含量': [45.7, 0.0, 8.3],\n    })\n\ndef test_行数(sample_df):             # 参数名 = fixture 名, 自动注入\n    assert len(sample_df) == 3\n\ndef test_去除零值(sample_df):\n    out = sample_df[sample_df['含量'] > 0]\n    assert out['含量'].min() > 0` },
      ],
      pitfalls: [
        'fixture 按参数名注入，<b>不是按位置</b>；测试函数的参数名必须和 fixture 函数名完全一致。',
        '每个测试拿到的是<b>独立副本调用</b>（默认 scope="function"），一个测试改了数据不影响下一个；要共享用 @pytest.fixture(scope="module")。',
        '临时文件用内置 tmp_path fixture：def test_write(tmp_path): p = tmp_path / "a.txt"，测完自动清理。',
      ],
      related: ['assert-基础', '参数化'],
      tags: ['fixture', '测试数据', 'tmp_path'],
    },
    {
      name: '参数化', sig: "@pytest.mark.parametrize('a, b, 期望', [(1, 2, 3), (0, 0, 0)])",
      brief: '一条测试逻辑跑多组数据：边界值全覆盖。',
      examples: [
        { title: '', code: `import pytest\nfrom calc import add\n\n@pytest.mark.parametrize('a, b, expect', [\n    (1, 2, 3),\n    (0, 0, 0),\n    (-1, 1, 0),\n    (2.5, 2.5, 5.0),\n])\ndef test_add_many(a, b, expect):\n    assert add(a, b) == expect\n\n# 中文用例名更好读:\n@pytest.mark.parametrize('含量, 合格', [(45.7, True), (-1, False)],\n                         ids=['正常值', '负数异常'])` },
      ],
      pitfalls: [
        '参数化是<b>每行数据一个独立测试</b>，某行失败不影响其他行——比在循环里 assert 强得多（循环版第一组失败后面全不跑）。',
        '边界值思维：0、负数、空串、极大值各来一行，bug 最爱藏在边界。',
        '用例多了输出太长时加 <code>-q</code> 简洁模式，或 <code>--tb=short</code> 缩短报错栈。',
      ],
      related: ['assert-基础', 'fixture'],
      tags: ['parametrize', '参数化', '边界值'],
    },
  ],
});
