const fs = require('fs');
const Discord = require("discord.js");
const client = new Discord.Client();
const data = require('quick.db')
const moment = require("moment");
const ayarlar=require("./ayarlar.json");
const express = require('express');
const app = express()
app.get('/', (req, res) => res.send("Bot aktif edildi."))
app.listen(process.env.PORT, () => console.log('Port ayarlandı ' + process.env.PORT))


    
client.on("message", message => {
  let client = message.client;
  if (message.author.bot) return;
  if (!message.content.startsWith(ayarlar.prefix)) return;
  let command = message.content.split(' ')[0].slice(ayarlar.prefix.length);
  let params = message.content.split(' ').slice(1);
  let perms = client.yetkiler(message);
  let cmd;
  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
  }
    
  if (cmd) {
    if (perms < cmd.conf.permLevel) return;
    cmd.run(client, message, params, perms);
  }
  fs.readdir("./Events", (err, files) => {
    if(err) return console.error(err);
    files.filter(file => file.endsWith(".js")).forEach(file => {
        let prop = require(`./Events/${file}`);
        if(!prop.configuration) return;
        client.on(prop.configuration.name, prop);
    });
});
})


client.login(process.env.token).then(c => console.log(`${client.user.tag} olarak giriş yapıldı!`)).catch(err => console.error("Bota giriş yapılırken başarısız olundu!"));
let  aias = "Snow 💙 Guard";
client.on("ready", async () => {
  client.appInfo = await client.fetchApplication();
  setInterval(async () => {
    client.appInfo = await client.fetchApplication();
  }, 5000);
  client.user.setActivity(aias, {
    type: "STREAMING",
    url: "Snow 💙 Guard"
  });
  console.log(`${client.user.username} ismiyle bağlandım.`);
});



const log = message => {
  console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message}`);
};



client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./commands/', (err, files) => {
  if (err) console.error(err);
  log(`${files.length} adet komut yüklemeye hazırlanılıyor.`);
  files.forEach(f => {
    let props = require(`./commands/${f}`);
    console.log(`Yüklendi: ${props.help.name}`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});


client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./commands/${command}`)];
      let cmd = require(`./commands/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./commands/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./commands/${command}`)];
      let cmd = require(`./commands/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};
  
client.yetkiler = message => {
  if(!message.guild) {
	return; }
  let permlvl = 0;
  if(message.member.hasPermission("MANAGE_MESSAGES")) permlvl = 1;
  if(message.member.hasPermission("KICK_MEMBERS")) permlvl = 2;
  if(message.member.hasPermission("BAN_MEMBERS")) permlvl = 3;
  if(message.member.hasPermission("MANAGE_GUILD")) permlvl = 4;
  if(message.member.hasPermission("ADMINISTRATOR")) permlvl = 5;
  if(message.author.id === message.guild.ownerID) permlvl = 6;
  if(message.author.id === ayarlar.sahip) permlvl = 7;
  return permlvl;
};

//Aias Chat Guard
//Caps Lock
client.on("message", async (message,msg) => {
  var guild = message.guild
  
  if(message.channel.type !== 'text') return;
    if(message.author.bot) return;  
      if (message.content.length > 4) {
       if (data.fetch(`caps.${message.guild.id}`)) {
         let caps = message.content.toUpperCase()
         if (message.content == caps) {
           if (!message.member.hasPermission("ADMINISTRATOR")) {
             if (!message.mentions.users.first()) {
              message.delete();
               return message.channel.send(`✋ ${message.author}, Bu sunucuda, büyük harf kullanımı engellenmekte!`).then(m => m.delete({timeout: 5000}));
              }
              client.channels.cache.get(ayarlar.logkanal).send(new Discord.MessageEmbed()
               .setAuthor(`ÇOK FAZLA BÜYÜK HARF!`, message.author.avatarURL())
               .setDescription(`${message.author} Çok fazla büyük harf içeren mesaj attı!\n 
               `)
               .addField("Çok fazla büyük harf içeren mesaj", "```" + message.content + "```")
               .setFooter(`developed by aias & where was i`)
               .setTimestamp())
              
     }
   }
 }
}
});
//Mesaj silme
//Mesaj düzenleme
//Chat Guard
//Küfür engel
client.on("messageDelete", async deletedMessage => {
  var guild = deletedMessage.guild
 
  if (deletedMessage.author.bot || deletedMessage.channel.type === "dm") return;
  client.channels.cache.get(ayarlar.logkanal).send(new Discord.MessageEmbed()
    .setColor("RANDOM")
    .setAuthor(`Mesaj Silindi`, deletedMessage.author.avatarURL())
    .addField("Kullanıcı", deletedMessage.author)
    .addField("Silinen Mesaj", "```" + deletedMessage.content + "```")
    .addField("Kanal Adı", deletedMessage.channel.name)
    .addField("Mesaj ID", deletedMessage.id)
    .addField("Kullanıcı ID", deletedMessage.author.id)
    .setFooter(`developed by aias & where was i  • bügün saat ${deletedMessage.createdAt.getHours() +
        3}:${deletedMessage.createdAt.getMinutes()}`
  ));
    
})



client.on("messageUpdate", async (oldMessage, newMessage) => {
  var guild = newMessage.guild
  
  if (newMessage.author.bot || newMessage.channel.type === "dm") return;

  if (oldMessage.content == newMessage.content) return;
  let embed = new Discord.MessageEmbed()
    .setColor("RANDOM")
    .setAuthor(`Mesaj Düzenlendi`, newMessage.author.avatarURL())
    .addField("Kullanıcı", newMessage.author)
    .addField("Eski Mesaj", "```" + oldMessage.content + "```")
    .addField("Yeni Mesaj", "```" + newMessage.content + "```")
    .addField("Kanal Adı", newMessage.channel.name)
    .addField("Mesaj ID", newMessage.id)
    .addField("Kullanıcı ID", newMessage.author.id)
    .setFooter(`developed by aias & where was i  • bügün saat ${newMessage.createdAt.getHours() +
        3}:${newMessage.createdAt.getMinutes()}`
    );
    client.channels.cache.get(ayarlar.logkanal).send(embed);
});
 //düzenlenen mesajda küfür

 client.on("messageUpdate", async (oldMessage, newMessage, message) => {
  var guild = newMessage.guild
  
  const chat = await data.fetch(`chat.${newMessage.guild.id}`);
  if(!chat) return;
  const blacklist = ["oruspu","orsubu","orusbu","pç","yarrak", "top", "ibne", "sequ", "sgmal", "am", "amcık", "yarak", "amkcoc", "anneni", "pic", "oros", "kitabını", "sikik", "sg", "sq", "mal", "annesiz", "allahını", "rabbini", "oç", "amk", "ananı sikiyim", "ananıskm", "piç", "amk", "amsk", "sikim", "sikiyim", "orospu çocuğu", "piç kurusu", "kahpe", "orospu", "sik", "yarrak", "amcık", "amık", "yarram", "sikimi ye", "mk", "mq", "aq", "amq", "oc", "ananı","siktir","amk","piç","orospu","götünü","götün","sikim","göt","yavşak","yawşak"];
  const uyarılar = [
  'Bu sunucu da küfürler engellenmektedir!',
  ];
  let uyarımesaj = uyarılar[Math.floor(Math.random() * uyarılar.length)];
  let content = newMessage.content.split(' ');
  
  content.forEach(kelime => {
  if(blacklist.some(chat => chat === kelime))  {
  if(newMessage.member.permissions.has('ADMINISTRATOR')) return;
  newMessage.delete();
  client.channels.cache.get(ayarlar.logkanal).send(new Discord.MessageEmbed()
.setAuthor(`KÜFÜR İÇEREN MESAJ!`, newMessage.author.avatarURL())
.setDescription(`${newMessage.author} Küfür içeren mesaj attı!\n 
`)
.addField("Küfür içeren mesaj", "```" + newMessage.content + "```")
.setFooter(`developed by aias & where was i`)
.setTimestamp())
  }
  })
});
client.on('message', async message => {
  var guild = message.guild
 
  if(message.channel.type !== 'text') return;
  const chat = await data.fetch(`chat.${message.guild.id}`);
  if(!chat) return;
  const blacklist = ["Aq","Oç","Amk","AMK","oruspu","orsubu","orusbu","pç","yarrak", "top", "ibne", "sequ", "sgmal", "am", "amcık", "yarak", "amkcoc", "anneni", "pic", "oros", "kitabını", "sikik", "sg", "sq", "mal", "annesiz", "allah", "allahını", "rabbini", "oç", "amk", "ananı sikiyim", "ananıskm", "piç", "amk", "amsk", "sikim", "sikiyim", "orospu çocuğu", "piç kurusu", "kahpe", "orospu", "sik", "yarrak", "amcık", "amık", "yarram", "sikimi ye", "mk", "mq", "aq", "amq", "oc", "ananı","siktir","amk","piç","orospu","götünü","götün","sikim","göt","yavşak","yawşak","AQ","AMQ","SİKİK","SİKTİM","SİKTİR","PİÇ","OROSPU","KAŞAR","GÖT"];
  const uyarılar = [
  'Bu sunucu da küfürler engellenmektedir!',
  ];
  let uyarımesaj = uyarılar[Math.floor(Math.random() * uyarılar.length)];
  let content = message.content.split(' ');
  
  content.forEach(kelime => {
  if(blacklist.some(chat => chat === kelime))  {
  if(message.member.permissions.has('ADMINISTRATOR')) return;
  message.delete();
  message.channel.send
  (new Discord.MessageEmbed()  
.setColor('#36393e')
.setTimestamp()   
.setFooter("developed by aias & where was i")
.setDescription(`${message.author} ${uyarımesaj}`)).then(m => m.delete({timeout: 2000}));
client.channels.cache.get(ayarlar.logkanal).send(new Discord.MessageEmbed()
.setAuthor(`KÜFÜR İÇEREN MESAJ!`, message.author.avatarURL())
.setDescription(`${message.author} Küfür içeren mesaj attı!\n 
`)
.addField("Küfür içeren mesaj", "```" + message.content + "```")
.setFooter(`developed by aias & where was i`)
.setTimestamp())
  }
  })
});
//Düzenlenen mesajda reklam engel
  //Reklam engel
  client.on('messageUpdate', async (oldMessage,newMessage) => {
    var guild = newMessage.guild
    
  const reklam = await data.fetch(`reklam.${newMessage.guild.id}`);
  if(!reklam) return;
  const blacklist = [".com", ".net", ".xyz", ".tk", ".pw", ".io", ".me", ".gg", "www.", "https", "http", ".gl", ".org", ".com.tr", ".biz", "net", ".rf.gd", ".az", ".party", "discord.gg"];
  const uyarılar = [
  'Bu sunucu da reklamlar engellenmektedir!',
  ];
  let uyarımesaj = uyarılar[Math.floor(Math.random() * uyarılar.length)];
  if(blacklist.some(a => newMessage.content.includes(a)))  {
  if(newMessage.member.permissions.has('ADMINISTRATOR')) return;
  newMessage.delete();
  client.channels.cache.get(ayarlar.logkanal).send(new Discord.MessageEmbed()
.setAuthor(`REKLAM İÇEREN MESAJ!`, newMessage.author.avatarURL())
.setDescription(`${newMessage.author} reklam içeren mesaj attı!\n`)
.addField("Reklam içeren mesaj", "```" + newMessage.content + "```")
.setFooter(`developed by aias & where was i`)
.setTimestamp())
  }
  
  });
  //Reklam engel
  client.on('message', async message => {
    var guild = message.guild
   
    if(message.channel.type !== 'text') return;
  const reklam = await data.fetch(`reklam.${message.guild.id}`);
  if(!reklam) return;
  const blacklist = [".com", ".net", ".xyz", ".tk", ".pw", ".io", ".me", ".gg", "www.", "https", "http", ".gl", ".org", ".com.tr", ".biz", "net", ".rf.gd", ".az", ".party", "discord.gg"];
  const uyarılar = [
  'Bu sunucu da reklamlar engellenmektedir!',
  ];
  let uyarımesaj = uyarılar[Math.floor(Math.random() * uyarılar.length)];
  if(blacklist.some(a => message.content.includes(a)))  {
  if(message.member.permissions.has('ADMINISTRATOR')) return;
  message.delete();
  message.channel.send(
new Discord.MessageEmbed()  
.setColor('#36393e')
.setFooter("developed by aias & where was i")
.setTimestamp()
.setDescription(`${message.author} ${uyarımesaj}`)).then(m => m.delete({timeout: 2000}));
client.channels.cache.get(ayarlar.logkanal).send(new Discord.MessageEmbed()
.setAuthor(`REKLAM İÇEREN MESAJ!`, message.author.avatarURL())
.setDescription(`${message.author} reklam içeren mesaj attı!\n`)
.addField("Reklam içeren mesaj", "```" + message.content + "```")
.setFooter(`developed by aias & where was i`)
.setTimestamp())
  }
  
  });

  //Reklam Ban Sistemi
  client.on('message', async message => {
    var guild = message.guild
    
    if(message.channel.type !== 'text') return;
  const reklam = await data.fetch(`reklamban.${message.guild.id}`);
  if(!reklam) return;
  const blacklist = [".com", ".net", ".xyz", ".tk", ".pw", ".io", ".me", ".gg", "www.", "https", "http", ".gl", ".org", ".com.tr", ".biz", "net", ".rf.gd", ".az", ".party", "discord.gg"];
  const uyarılar = [
  'Bu sunucu da reklamlar engellenmektedir!',
  ];
  let uyarımesaj = uyarılar[Math.floor(Math.random() * uyarılar.length)];
  if(blacklist.some(a => message.content.includes(a)))  {
  if(message.member.permissions.has('ADMINISTRATOR')) return;
  message.guild.members.ban(message.author, {reason: "Reklam Koruma Sistemi" })
 
  message.channel.send(
new Discord.MessageEmbed()  
.setColor('#36393e')
.setFooter("developed by aias & where was i")
.setTimestamp()
.setDescription(`${message.author} ${uyarımesaj}`)).then(m => m.delete({timeout: 2000}));
client.channels.cache.get(ayarlar.logkanal).send(new Discord.MessageEmbed()
.setAuthor(`REKLAM İÇEREN MESAJ!`, message.author.avatarURL())
.setDescription(`${message.author} reklam içeren mesaj attı! Ve onu banladım!\n`)
.addField("Reklam içeren mesaj", "```" + message.content + "```")
.setFooter(`develeoped by aias & where was i`)
.setTimestamp())
  }
  
  });


//Chat Guard Son

client.on("ready", () => {
  client.channels.cache.get("842536774462341150").join();   
})