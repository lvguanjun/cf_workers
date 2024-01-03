addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // 获取用户 IP 地址
  let ip = request.headers.get("cf-connecting-ip");

  const url = new URL(request.url);
  const newRequest = new Request(url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });

  // 添加用户 IP 地址到新请求的 headers 中
  newRequest.headers.set("X-User-IP", ip);

  // 获取请求的 User-Agent 和 Referer
  const userAgent = request.headers.get("User-Agent");
  const referer = request.headers.get("Referer");

  // 如果请求方法不是POST，放行正常请求
  if (request.method !== "POST") {
    return fetch(newRequest);
  }

  // 指定IP列表，需要配置环境变量 ATTACK_IP_LIST ，换行符分割
  // 当前配置的IP列表不多，暂时就用换行符分割，如果有更多IP，可以考虑用逗号分割
  // 从环境变量 ATTACK_IP_LIST 中提取IP列表
  let ipList = [];
  if (typeof ATTACK_IP_LIST !== "undefined") {
    ipList = ATTACK_IP_LIST.split("\n").filter((ip) => ip !== "");
  }

  // 各种拦截条件
  const attackIp = ipList.includes(ip);
  const oneApi =
    userAgent === "Go-http-client/2.0" && (referer === null || referer === "");

  // 如果为attackIp，则返回包含随机个数的 "喵喵喵" 的响应
  if (attackIp) {
    console.log("喵喵ip：", ip);
    const n = Math.floor(Math.random() * 8) + 3; // 随机数组长度 3-10
    const timestamp = Math.floor(Date.now() / 1000);
    var punctuation_1 = ["，", "！", "？"];
    var punctuation_2 = ["！", "。", "？"];

    const responseBodies = [
      {
        id: "chatcmpl-KstKFAQWPLB2sFepfNFWdkRXb5F48",
        object: "chat.completion.chunk",
        created: timestamp,
        model: "gpt-4",
        choices: [
          {
            delta: {
              role: "assistant",
            },
            index: 0,
            finish_reason: null,
          },
        ],
      },
      ...Array(n)
        .fill()
        .map((_, i) => {
          return {
            id: "chatcmpl-KstKFAQWPLB2sFepfNFWdkRXb5F48",
            object: "chat.completion.chunk",
            created: timestamp,
            model: "gpt-4",
            choices: [
              {
                delta: {
                  content:
                    "喵".repeat(Math.floor(Math.random() * 10) + 1) +
                    punctuation_1[
                      Math.floor(Math.random() * punctuation_1.length)
                    ],
                },
                index: 0,
                finish_reason: null,
              },
            ],
          };
        }),
      {
        id: "chatcmpl-KstKFAQWPLB2sFepfNFWdkRXb5F48",
        object: "chat.completion.chunk",
        created: timestamp,
        model: "gpt-4",
        choices: [
          {
            delta: {
              content:
                "喵".repeat(Math.floor(Math.random() * 10) + 1) +
                punctuation_2[Math.floor(Math.random() * punctuation_2.length)],
            },
            index: 0,
            finish_reason: "stop",
          },
        ],
      },
      "data: [DONE]",
    ];
    let response = "";
    for (let body of responseBodies) {
      response += "data: " + JSON.stringify(body) + "\n\n";
    }

    return new Response(response, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // 拦截条件oneApi
  if (oneApi) {
    console.log("拦截ip：", ip);
    const responseBody = {
      message: "该API禁止接入oneapi，如果你认为被误拦，请参考issue更改。",
      issue: "https://github.com/lvguanjun/copilot_to_chatgpt4/issues/10",
    };

    return new Response(JSON.stringify(responseBody), {
      status: 403,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // 放行正常请求
  return fetch(newRequest);
}
