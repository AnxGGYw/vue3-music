// & 随机打乱数组元素
export const shuffle = source => {
  const arr = [...source]
  for (let i = 0; i < arr.length; i++) {
    const j = getRandomInt(i)
    if (i !== j) {
      swap(arr, i, j)
    }
  }
  return arr
}

// & 获取最大值为max的随机整数
export const getRandomInt = max => {
  return Math.floor(Math.random() * (max + 1))
}

// & 交换数组两个下标位置的元素
export const swap = (arr, i, j) => {
  ;[arr[i], arr[j]] = [arr[j], arr[i]]
}