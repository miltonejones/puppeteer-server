
/************************************************************************
 * helpers
 ************************************************************************/
 const tryParse = (d) => {
  try {
    return JSON.parse(d);
  } catch (e) {
    return { d, e };
  }
};

const wait = async function (time, fn, isAsync) {
  let now = new Date().getTime();
  const then = now + time;
  console.log("waiting %sms", time);
  while (now < then) {
    now = new Date().getTime();
  }
  if (isAsync && !!fn) {
    return await fn();
  }
  return fn && fn();
};


exports.tryParse = tryParse;
exports.wait = wait;