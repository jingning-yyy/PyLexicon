/* LLM API 调用速查：openai SDK 兼容格式（「速查」分类） */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'llmapi', name: 'LLM API 调用', icon: '💬', category: '速查',
  doc: 'https://platform.openai.com/docs/api-reference',
  desc: '用 openai SDK 的兼容格式调大模型：换厂商只改 base_url 和 model 名；聊天、流式输出、多轮对话一页速查。',
  install: 'pip install openai',
  pkg: 'openai',
  aliases: ['大模型', 'openai', 'deepseek', 'chatgpt', 'api', 'ai'],
  tips: [
    '行业惯例：国内外大多数厂商（DeepSeek/月之暗面/通义等）都提供 <b>openai SDK 兼容接口</b>——代码不变，换 base_url + model 名 + key 即可。',
    '<b>key 永远不要写进代码</b>：放环境变量或配置文件，git 里泄露的 key 会被自动扫描滥用。',
  ],
  entries: [
    {
      name: 'chat-基础', sig: "client = OpenAI(base_url=..., api_key=...) / client.chat.completions.create(model=, messages=[...])",
      brief: '最小对话请求：一段文字进去，一段回答出来。',
      examples: [
        { title: '', code: `from openai import OpenAI\n\nclient = OpenAI(\n    base_url='https://api.deepseek.com',   # 换厂商就改这里和模型名\n    api_key='sk-...',                       # 正式环境从环境变量读\n)\n\nresp = client.chat.completions.create(\n    model='deepseek-chat',\n    messages=[\n        {'role': 'system', 'content': '你是数据分析助手, 回答简洁。'},\n        {'role': 'user', 'content': '解释一下XRF谱图的K_alpha线'},\n    ],\n)\nprint(resp.choices[0].message.content)      # 回答在这里\nprint(resp.usage.total_tokens)              # 这次花了多少 token` },
      ],
      pitfalls: [
        'messages 三种角色：<b>system 定人设/规则</b>（放最前），user 是用户话，assistant 是模型之前说的话。',
        '回答内容固定取 <code>resp.choices[0].message.content</code>，别打成 resp.text。',
        'model 名是厂商各自的字符串（deepseek-chat / gpt-4o / qwen-max…），抄别人的代码先核对模型名是否存在。',
      ],
      related: ['流式输出', '多轮对话'],
      tags: ['大模型', 'chat', 'openai'],
    },
    {
      name: '流式输出', sig: "stream=True / for chunk in stream: print(chunk.delta, end='')",
      brief: '打字机效果：边生成边显示，长回答不干等。',
      examples: [
        { title: '', code: `stream = client.chat.completions.create(\n    model='deepseek-chat',\n    messages=[{'role': 'user', 'content': '写一段批量重命名文件的脚本'}],\n    stream=True,                             # 开流式\n)\n\nfull = []\nfor chunk in stream:\n    piece = chunk.choices[0].delta.content or ''   # 可能是 None!\n    full.append(piece)\n    print(piece, end='', flush=True)               # 逐段打印\nprint('\\n--- 共', len(''.join(full)), '字 ---')` },
      ],
      pitfalls: [
        '流式模式下<b>每个片段可能没有 content</b>（角色帧/空帧），<code>or \'\'</code> 兜底防 TypeError。',
        '流式拿不到完整 usage 统计（取决于厂商），要么最后单独查，要么估算。',
        '写文件/进数据库要攒完整文本（full 列表最后 join），别把半截流直接入库。',
      ],
      related: ['chat-基础'],
      tags: ['stream', '流式', '打字机'],
    },
    {
      name: '多轮对话', sig: "messages.append({'role': 'assistant', ...}) / 每轮把历史一起发过去",
      brief: '连续对话：API 本身没记忆，历史要自己维护。',
      examples: [
        { title: '', code: `history = [\n    {'role': 'system', 'content': '你是实验数据助手。'},\n]\n\ndef ask(question):\n    history.append({'role': 'user', 'content': question})\n    resp = client.chat.completions.create(\n        model='deepseek-chat', messages=history,\n    )\n    answer = resp.choices[0].message.content\n    history.append({'role': 'assistant', 'content': answer})   # 记住自己的回答\n    return answer\n\nask('谱图峰位怎么定?')\nask('刚才说的第二种方法, 给个代码')   # "刚才"能生效, 靠的是完整 history 重发` },
      ],
      pitfalls: [
        '<b>API 是无状态的</b>："上一句"能被理解，是因为你把整个 history 重发了一遍——多轮很烧 token。',
        '历史太长会超上下文限制：system 保持不动、裁掉最旧的几轮，或直接做摘要压缩。',
        'system 消息放列表最前面；每轮都重复追加 system 会让模型行为漂移。',
      ],
      related: ['chat-基础', '流式输出'],
      tags: ['多轮', '上下文', 'history'],
    },
  ],
});
