// exports.getDate = function () {
//   // body...
//   const date = new Date();
//   const d = date.getDate();
//   const m = date.getMonth() + 1;
//   const y = date.getFullYear();
//   if (d < 10) {
//     d = '0' + d;
//   }
//   if (m < 10) {
//     m = '0' + m;
//   }
//   return (y + '-' + m + '-' + d);
// }


exports.checkDuplicateUserId = function (userId, votersIds) {
  // body...
  for (let i = 0; i < votersIds.length; i++) {
    //check to see if the user is in database
    if (votersIds.includes(userId)) {
      return true;
    } else {
      return false;
    }
  }
}
exports.sendNotificationToUsers = function (users, sender, pollId, message, date, isComment) {
  // body...
  /*
  INSERT INTO public."Item" (userId, message, date)
  VALUES  (1, 'this is 1st message', 02-12-18),
          (2, 'this is 2nd message' 03-13-18),
          (3,'this is 3rd message' 04-01-18)
  */
  let array = ``;
  for (let i = 0; i < users.length; i++) {
    let userId = users[i];
    if (array === ``) {
      array = array + `(${userId}, ${sender},${pollId},'${message}','${date}','${isComment}')`
    } else {
      array = array + `,` + `(${userId},${sender},${pollId},'${message}','${date}','${isComment}')`;
    }
  }
  return array
}