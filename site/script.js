"use strict";

const BUCKET_COUNT = 7;

// 연결 리스트 노드: 하나의 키와 값, 다음 노드의 참조를 저장합니다.
class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.next = null;
  }
}

// 각 칸은 해당 버킷의 연결 리스트 첫 노드(head)를 가리킵니다.
const buckets = new Array(BUCKET_COUNT).fill(null);
let itemCount = 0;

const keyInput = document.getElementById("key-input");
const valueInput = document.getElementById("value-input");
const valueHint = document.getElementById("value-hint");
const bucketList = document.getElementById("bucket-list");
const resultBox = document.getElementById("result");
const loadFactorText = document.getElementById("load-factor");

function hash(key) {
  return key % BUCKET_COUNT;
}

function showResult(message, kind = "neutral") {
  resultBox.dataset.kind = kind;
  resultBox.querySelector(".result-mark").textContent = kind === "success" ? "✓" : kind === "error" ? "!" : "i";
  resultBox.querySelector("p").textContent = message;
}

function readKey() {
  const rawKey = keyInput.value.trim();
  if (rawKey === "") {
    showResult("키를 입력하세요. 키는 0부터 999999 사이의 정수입니다.", "error");
    keyInput.focus();
    return null;
  }

  const key = Number(rawKey);
  if (!Number.isInteger(key) || key < 0 || key > 999999) {
    showResult("올바르지 않은 키입니다. 0부터 999999 사이의 정수를 입력하세요.", "error");
    keyInput.focus();
    return null;
  }
  return key;
}

function findNode(key, bucketIndex) {
  let current = buckets[bucketIndex];
  while (current !== null) {
    if (current.key === key) return current;
    current = current.next;
  }
  return null;
}

function insertOrUpdate() {
  const key = readKey();
  if (key === null) return;
  const value = valueInput.value.trim();
  const bucketIndex = hash(key);

  if (value.length === 0) {
    showResult(`버킷 ${bucketIndex} · 값을 입력하세요. 값은 비워 둘 수 없습니다.`, "error");
    valueInput.focus();
    return;
  }

  const existing = findNode(key, bucketIndex);
  if (existing !== null) {
    existing.value = value;
    showResult(`버킷 ${bucketIndex} · 키 ${key}의 값을 수정했습니다.`, "success");
  } else {
    const newNode = new Node(key, value);
    if (buckets[bucketIndex] === null) {
      buckets[bucketIndex] = newNode;
    } else {
      let current = buckets[bucketIndex];
      while (current.next !== null) current = current.next;
      current.next = newNode;
    }
    itemCount += 1;
    showResult(`버킷 ${bucketIndex} · 키 ${key}를 삽입했습니다.`, "success");
  }
  renderBuckets();
}

function search() {
  const key = readKey();
  if (key === null) return;
  const bucketIndex = hash(key);
  const node = findNode(key, bucketIndex);
  if (node === null) {
    showResult(`버킷 ${bucketIndex} · 키 ${key}를 찾지 못했습니다.`, "error");
  } else {
    showResult(`버킷 ${bucketIndex} · 키 ${key}의 값은 “${node.value}”입니다.`, "success");
  }
}

function remove() {
  const key = readKey();
  if (key === null) return;
  const bucketIndex = hash(key);
  let current = buckets[bucketIndex];
  let previous = null;

  while (current !== null && current.key !== key) {
    previous = current;
    current = current.next;
  }

  if (current === null) {
    showResult(`버킷 ${bucketIndex} · 키 ${key}를 찾지 못해 삭제하지 않았습니다.`, "error");
    return;
  }

  if (previous === null) {
    buckets[bucketIndex] = current.next;
  } else {
    previous.next = current.next;
  }
  itemCount -= 1;
  showResult(`버킷 ${bucketIndex} · 키 ${key}를 삭제했습니다.`, "success");
  renderBuckets();
}

function reset() {
  for (let index = 0; index < BUCKET_COUNT; index += 1) buckets[index] = null;
  itemCount = 0;
  keyInput.value = "";
  valueInput.value = "";
  showResult("초기화했습니다. 모든 버킷이 비어 있습니다.", "success");
  renderBuckets();
}

function renderBuckets() {
  bucketList.replaceChildren();

  for (let index = 0; index < BUCKET_COUNT; index += 1) {
    const row = document.createElement("div");
    row.className = "bucket-row";

    const label = document.createElement("div");
    label.className = "bucket-label";
    const indexBadge = document.createElement("span");
    indexBadge.className = "bucket-index";
    indexBadge.textContent = String(index);
    const bucketName = document.createElement("span");
    bucketName.textContent = `bucket[${index}]`;
    label.append(indexBadge, bucketName);

    const chain = document.createElement("div");
    chain.className = "bucket-chain";
    let current = buckets[index];
    if (current === null) {
      const empty = document.createElement("span");
      empty.className = "empty-chain";
      empty.textContent = "비어 있음 · null";
      chain.append(empty);
    } else {
      while (current !== null) {
        const node = document.createElement("span");
        node.className = "node";
        const key = document.createElement("span");
        key.className = "node-key";
        key.textContent = String(current.key);
        const value = document.createElement("span");
        value.className = "node-value";
        value.textContent = current.value;
        value.title = current.value;
        node.append(key, value);
        chain.append(node);

        const arrow = document.createElement("span");
        arrow.className = "chain-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "→";
        chain.append(arrow);
        current = current.next;
      }
      const end = document.createElement("span");
      end.className = "empty-chain";
      end.textContent = "null";
      chain.append(end);
    }

    row.append(label, chain);
    bucketList.append(row);
  }

  loadFactorText.textContent = (itemCount / BUCKET_COUNT).toFixed(2);
}

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    switch (button.dataset.action) {
      case "insert": insertOrUpdate(); break;
      case "search": search(); break;
      case "delete": remove(); break;
      case "reset": reset(); break;
    }
  });
});

valueInput.addEventListener("focus", () => {
  valueHint.textContent = "짧은 문자열 · 삽입 시 필요";
});
valueInput.addEventListener("blur", () => {
  valueHint.textContent = "삽입 시 필요 · 검색·삭제에는 불필요";
});

renderBuckets();

