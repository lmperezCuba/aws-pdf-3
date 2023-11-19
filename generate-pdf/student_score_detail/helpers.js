exports.arrayGroupBy = (arr, column) =>
  arr.reduce(function (r, a) {
    r[a[column]] = r[a[column]] || []
    r[a[column]].push(a)
    return r
  }, Object.create(null))

exports.arraySort = (arr, column, order = 'ASC') => {
  return arr.sort((a, b) => {
    const valueA = typeof column === 'string' ? a[column].toUpperCase() : a[column]
    const valueB = typeof column === 'string' ? b[column].toUpperCase() : b[column]

    if (valueA < valueB) {
      return order === 'ASC' ? -1 : 1
    }
    if (valueA > valueB) {
      return order === 'ASC' ? 1 : -1
    }
    return 0
  })
}

exports.objectSort = objectUnordered => {
  return Object.keys(objectUnordered)
    .sort()
    .reduce((obj, key) => {
      obj[key] = objectUnordered[key]
      return obj
    }, {})
}

exports.getMeasure = points => {
  if (points <= 25) {
    return 0
  } else if (points > 25 && points <= 50) {
    return 1
  } else if (points > 50 && points <= 75) {
    return 2
  } else {
    return 3
  }
}

exports.getPlanetSize = (count, maxNum) => {
  if (!maxNum || !count) {
    return 'xs'
  }
  const range = maxNum / 5
  if (count > range && count <= range * 2) {
    return 'md'
  } else if (count > range * 2 && count <= range * 3) {
    return 'lg'
  } else if (count > range * 3 && count <= range * 4) {
    return 'xl'
  } else if (count > range * 4) {
    return 'xxl'
  }
  return 'sm'
}

exports.isEqual = (obj1, obj2) => {
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  if (keys1.length !== keys2.length) {
    return false
  }
  for (let key of keys1)
    if (obj1[key] !== obj2[key]) {
      return false
    }
  return true
}

const milSecondsToString = milSeconds => {
  let minutes = Math.floor(milSeconds / 3600)
  minutes = minutes < 10 ? '0' + minutes : minutes
  let seconds = Math.floor((milSeconds / 60) % 60)
  seconds = seconds < 10 ? '0' + seconds : seconds
  let milSecond = milSeconds % 60
  milSecond = milSecond < 10 ? '0' + milSecond : milSecond
  return minutes + 'm:' + seconds + 's:' + milSecond + 'ms'
}

exports.showExceutionTime = async (fn) => {
  let start = new Date()
  const resp = await fn()
  const milSeconds = new Date() - start
  const humanTime = milSecondsToString(milSeconds)
  console.log(humanTime) //no borrar
  return resp
}
