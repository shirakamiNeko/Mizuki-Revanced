/// <reference types="mdast" />
import { h } from "hastscript";

export function rehypeChat(properties, children) {
  console.log("[rehypeChat] ===== CALLED =====");
  console.log("[rehypeChat] properties:", JSON.stringify(properties));
  console.log("[rehypeChat] children length:", children?.length);
  
  const result = h("div", { class: "chat-container-test" }, [
    h("p", {}, "THIS IS A TEST MESSAGE FROM REHYPE-CHAT")
  ]);
  
  console.log("[rehypeChat] returning:", JSON.stringify(result));
  
  return result;
}
