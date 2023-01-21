const moment = require('moment')
// // // // let jam = "9:00 PM"

// // // // let curdate = moment().format('YYYY-MM-DD')
// // // // let n = `${curdate},${jam}`
// // // // let h = moment(n,'YYYY-MM-DD,hh mm A').format('YYYY-MM-DD HH-mm-ss')
// // // // console.log(h);
// // // // var dt = moment(jam, ["h:mm A"]).format("HH:mm");
// // // // console.log(dt);


// // // // console.log( moment('2022-10-16 11:00 PM', 'YYYY-MM-DD hh:mm A').format('YYYY-MM-DD hh:mm:ss') );

// // // let curdate= moment().add(1,'d').format('YYYY-MM-DD')

// // // console.log(curdate);

// // let t = moment().format('x')
// // console.log(t.substring(t.length - 6));
// const { createClient } = require("redis")
// const client = createClient({ url: `redis://serova.id:8379`, legacyMode: true });
// client.connect().catch(console.error)
// const ClusterCronJob = require('cron-cluster')(client, { key: "leaderKey" }).CronJob;

// // console.log(redis);
// function doCron() {
//     console.log("tesssssssssss");
//     var job = new ClusterCronJob('* * * * * *', function () {
//         console.log(moment().format(), "per dua detik");
//         // console.log("per dua detik");
//     })
//     job.start()
// }
// doCron()
