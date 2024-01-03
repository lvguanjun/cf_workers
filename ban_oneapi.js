addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

function generateResponseBody(contentArray) {
  const timestamp = Math.floor(Date.now() / 1000);
  const fixedStart = {
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
  };

  const fixedEnd = {
    id: "chatcmpl-KstKFAQWPLB2sFepfNFWdkRXb5F48",
    object: "chat.completion.chunk",
    created: timestamp,
    model: "gpt-4",
    choices: [
      {
        delta: {},
        index: 0,
        finish_reason: "stop",
      },
    ],
  };

  const contentBodies = contentArray.map((content) => {
    return {
      id: "chatcmpl-KstKFAQWPLB2sFepfNFWdkRXb5F48",
      object: "chat.completion.chunk",
      created: timestamp,
      model: "gpt-4",
      choices: [
        {
          delta: {
            content: content,
            role: "assistant",
          },
          index: 0,
          finish_reason: null,
        },
      ],
    };
  });

  let response = "";
  for (let body of [fixedStart, ...contentBodies, fixedEnd]) {
    response += "data: " + JSON.stringify(body) + "\n\n";
  }
  response += "data: [DONE]\n\n";

  return response;
}

function generateOkResponse(body) {
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

async function handleRequest(request) {
  // 如果请求方法不是POST，放行正常请求
  if (request.method !== "POST") {
    return fetch(request);
  }

  // 获取用户 IP 地址，User-Agent 和 Referer
  let ip = request.headers.get("cf-connecting-ip");
  const userAgent = request.headers.get("User-Agent");
  const referer = request.headers.get("Referer");

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
  if (attackIp || oneApi) {
    console.log("喵喵ip：", ip);
    const n = Math.floor(Math.random() * 8) + 3;
    var punctuation_1 = ["，", "！", "？"];
    var punctuation_2 = ["！", "。", "？"];
    let contentArray = Array(n)
      .fill()
      .map((_) => {
        return (
          "喵".repeat(Math.floor(Math.random() * 10) + 1) +
          punctuation_1[Math.floor(Math.random() * punctuation_1.length)]
        );
      });
    contentArray.push(
      "喵".repeat(Math.floor(Math.random() * 10) + 1) +
        punctuation_2[Math.floor(Math.random() * punctuation_2.length)]
    );
    const response = generateResponseBody(contentArray);
    return generateOkResponse(response);
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

  return fetch(request);
}
