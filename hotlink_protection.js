addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

function ipCIDRCheck(ip, cidr) {
  if (!cidr.includes("/")) {
    return ip === cidr;
  }
  var [range, bits] = cidr.split("/");
  var mask = (-1 << (32 - Number(bits))) >>> 0; // 修正子网掩码的计算
  var ipLong =
    ip.split(".").reduce(function (ipInt, octet) {
      return (ipInt << 8) + parseInt(octet, 10);
    }, 0) >>> 0;
  var rangeLong =
    range.split(".").reduce(function (ipInt, octet) {
      return (ipInt << 8) + parseInt(octet, 10);
    }, 0) >>> 0;
  return (ipLong & mask) === (rangeLong & mask); // 使用严格等于运算符进行比较
}

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

const handleRequest = async (request) => {
  // 如果请求方法不是POST，放行正常请求
  if (request.method !== "POST") {
    return fetch(request);
  }

  const ip = request.headers.get("cf-connecting-ip");
  let blockedIPs = [];
  if (typeof IP_LIST !== "undefined") {
    blockedIPs = IP_LIST.split("\n");
  }

  const ipBlocked = blockedIPs.some((blockedIP) => ipCIDRCheck(ip, blockedIP));
  const contact = "[Telegram](https://t.me/+9w4JwuHnkpI2ODM1)";

  if (ipBlocked) {
    console.log("IP blocked: " + ip);
    const response = generateResponseBody([
      "当前ip怀疑滥用API，已被封禁，有疑问联系 " + contact + "。",
    ]);
    return generateOkResponse(response);
  }

  const url = new URL(request.url);
  const referer = request.headers.get("Referer") || "";
  const expectedReferer = `https://${url.host}/`;
  const isInvalidReferer = referer !== expectedReferer;

  if (isInvalidReferer) {
    console.log("Invalid referer ip: " + ip);
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

  return fetch(request);
};
