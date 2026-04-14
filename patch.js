const fs = require('fs');

let content = fs.readFileSync('client/src/pages/Feed.jsx', 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

if (!content.includes('import toast from')) {
    content = content.replace('import ProfileCard from "../components/ProfileCard";', 'import ProfileCard from "../components/ProfileCard";\nimport toast from "react-hot-toast";');
}

const actionRegex = /if \(direction === "right"\) \{\s*\/\/ ✅ CONNECT\s*await api\.post\(`\/request\/\$\{user\._id\}`\);\s*\}\s*\/\/ ❌ left swipe → skip only\s*\} catch \(err\) \{\s*console\.error\("Action error:", err\);\s*\}/s;

const actionNew = `if (direction === "right") {
        // ✅ CONNECT
        const res = await api.post(\`/request/\${user._id}\`);
        if (res.data?.message?.includes("match") || res.data?.message?.includes("Match") || res.data?.message?.includes("🎉")) {
          toast.success(\`It's a Match with \${user.firstName}! 🎉\`, {
            duration: 4000,
            icon: '🔥',
          });
        } else {
          toast.success("Request sent!");
        }
      }
      // ❌ left swipe → skip only
    } catch (err) {
      console.error("Action error:", err);
      if (err.response?.data?.message) {
         toast.error(err.response.data.message);
      }
    }`;

content = content.replace(actionRegex, actionNew);

if (!content.includes('dragOffset={0}')) {
    content = content.replace(/onConnect=\{\(\) => \{\}\}/g, 'onConnect={() => {}}\n              dragOffset={0}');
}

if (!content.includes('dragOffset={dragX}')) {
    content = content.replace(/onConnect=\{\(\) => handleAction\("right"\)\}/g, 'onConnect={() => handleAction("right")}\n            dragOffset={dragX}');
}

fs.writeFileSync('client/src/pages/Feed.jsx', content);
