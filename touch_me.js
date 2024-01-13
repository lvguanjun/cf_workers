addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

const sites = [
  {
    label: "ChatGpt镜像共享站",
    host: "shared.3211000.xyz",
    url: "https://shared.3211000.xyz",
  },
  {
    label: "Chatgpt-Next-Web",
    host: "chat.3211000.xyz",
    url: "https://chat.3211000.xyz",
  },
  // 添加更多的站点
];

const contacts = [
  {
    label: "问题反馈",
    info: '<a target="_blank" href="https://t.me/+9w4JwuHnkpI2ODM1">Telegram Group</a>',
  },
];

async function handleRequest(request) {
  let url = new URL(request.url);
  let response = await fetch(request);

  // 仅针对 HTML 内容进行修改
  let contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("text/html")) {
    let text = await response.text();

    // 生成站点信息列表
    let siteInfo = sites.map((site) => {
      return {
        label: site.label,
        info: `<a target="_blank" href="${site.url}">${site.url}</a>`,
      };
    });

    // 合并站点信息和联系信息
    let contactInfo = [...siteInfo, ...contacts];

    // 生成 "更多信息" 的浮动窗口和联系方式的列表
    let contactHtml = `
        <link href="https://fonts.googleapis.com/css?family=Roboto&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
        <style>
          @media (max-width: 600px) {
            #contactInfo {
              width: 80vw;
              font-size: 0.8rem;
            }
          }
        </style>
        <div id="contactMe" style="position: fixed; bottom: 20px; right: 20px; background: #f9f9f9; padding: 10px; border: 1px solid #ccc; cursor: pointer; border-radius: 50%; width: 50px; height: 50px; display: flex; justify-content: center; align-items: center;box-sizing: border-box; z-index: 9999;">
          <i class="fas fa-info" style="font-size: 20px;"></i>
          <button id="hideIcon" style="position: absolute; top: -8px; right: -8px; background: #f9f9f9; border: none; font-size: 12px; line-height: 12px; padding: 8px; border-radius: 50%; color: #333;">X</button>
          <div id="contactInfo" style="display: none; position: fixed; right: 70px; bottom: 60px; background: #f9f9f9; padding: 10px 20px; border: 1px solid #ccc; border-radius: 5px; font-family: 'Roboto', sans-serif;">
            <table style="border-collapse: collapse; width: 100%;">
              ${contactInfo
                .map(
                  (item) =>
                    `<tr><td style="padding: 5px;"><strong>${item.label}：</strong></td><td style="padding: 5px;">${item.info}</td></tr>`
                )
                .join("")}
            </table>
          </div>
        </div>
        <script>
          function updateContactInfoPosition() {
            var contactMe = document.getElementById('contactMe');
            var contactInfo = document.getElementById('contactInfo');
            var rect = contactMe.getBoundingClientRect();
            contactInfo.style.right = (window.innerWidth - rect.right + 20) + 'px';
            contactInfo.style.bottom = (window.innerHeight - rect.bottom + 20) + 'px';
          }
  
          document.getElementById('contactMe').addEventListener('click', function() {
            var info = document.getElementById('contactInfo');
            info.style.display = info.style.display === 'none' ? 'block' : 'none';
            if (info.style.display !== 'none') {
              updateContactInfoPosition();
            }
          });
  
          document.getElementById('hideIcon').addEventListener('click', function(event) {
            event.stopPropagation();
            var icon = document.getElementById('contactMe');
            icon.style.display = 'none';
          });
        </script>
        <script>
        var contactMe = document.getElementById('contactMe');
    
        // Desktop
        contactMe.addEventListener('mousedown', handleMouseDown, false);
        window.addEventListener('mouseup', handleMouseUp, false);
    
        // Mobile
        contactMe.addEventListener('touchstart', handleTouchStart, false);
        window.addEventListener('touchend', handleTouchEnd, false);
    
        var drag = false;
        var oldX, oldY;
    
        function handleMouseDown(e) {
            drag = true;
            oldX = e.clientX;
            oldY = e.clientY;
        }
    
        function handleMouseUp() {
            drag = false;
        }
    
        function handleMouseMove(e) {
            if (drag) {
                contactMe.style.top = (contactMe.offsetTop + e.clientY - oldY) + 'px';
                contactMe.style.left = (contactMe.offsetLeft + e.clientX - oldX) + 'px';
                oldX = e.clientX;
                oldY = e.clientY;
            }
        }
    
        function handleTouchStart(e) {
            drag = true;
            oldX = e.touches[0].clientX;
            oldY = e.touches[0].clientY;
        }
    
        function handleTouchEnd() {
            drag = false;
        }
    
        function handleTouchMove(e) {
            if (drag) {
                contactMe.style.top = (contactMe.offsetTop + e.touches[0].clientY - oldY) + 'px';
                contactMe.style.left = (contactMe.offsetLeft + e.touches[0].clientX - oldX) + 'px';
                oldX = e.touches[0].clientX;
                oldY = e.touches[0].clientY;
            }
        }
    
        window.addEventListener('mousemove', handleMouseMove, false);
        window.addEventListener('touchmove', handleTouchMove, false);
    </script>
      `;

    // 在 HTML 结尾添加 "更多信息" 的浮动窗口
    let modified = text.replace("</body>", `${contactHtml}</body>`);

    // Creating a new response
    response = new Response(modified, response);
    response.headers.set("content-type", "text/html");
  }

  return response;
}
