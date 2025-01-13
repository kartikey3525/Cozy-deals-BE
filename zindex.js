function socketchatfunction(io) {
    // Middleware to authenticate socket connections
    io.use(async (socket, next) => {
      try {
        await AuthSocket(socket, next); // Execute authentication middleware
      } catch (err) {
        console.error("Socket middleware error:", err.message);
      }
    });
  
    // Event handler for new socket connections
    io.on("connection", async (socket) => {
      try {
        console.log(
          "====",
          socket.user._id,
          socket.user.id,
          socket.chatData._id,
          socket.chatData.id
        );
  
  
        
        // add user in connectedUser when they connected
        connectedUser.delete(socket.chatData.id);
        connectedUser.set(socket.chatData.id, socket.id);
  
        console.log("A user connected", socket.id, "socket.id");
  
        await viewChatMessage(io, socket);
  
        // // Event handler for sending chat messages
        socket.on("sendChatMessage", async (data) => {
          //data : {id: 662b4f7b72975e3f85cfb169 (_id), message: "hii", type: "text"}
          await sendChatMessage(io, socket, data);
        });
  
        // Event handler for viewing chat messages
        socket.on("viewChatMessage", async () => {
          await viewChatMessage(io, socket);
        });
  
        // Event handler for deleting chat messages
        socket.on("deleteChatMessage", async (data) => {
          //data : {id: "6631d306d045a7532367bb5a" (_id), messageId: "660a75e7dd2eebfca0329a24"}
          await deleteChatMessage(io, socket, data);
        });
  
        // Event handler for clear chat messages
        socket.on("clearChatMessage", async (data) => {
          //data : {id: "6631d306d045a7532367bb5a" (_id)}
          await clearChatMessage(io, socket, data);
        });
  
        // Event handler for delete chat
        socket.on("deleteChat", async (data) => {
          //data : {id: "6631d306d045a7532367bb5a" (_id)}
          await deleteChat(io, socket, data);
        });
  
        // Event handler for block or unblock chat
        socket.on("blockUnblockChat", async (data) => {
          //data : {id: "6631d306d045a7532367bb5a" (_id)}
          await blockUnblockChat(io, socket, data);
        });
  
        // Event handler for viewing single chat messages
        socket.on("viewSingleChat", async (data) => {
          //data : {id: 3 / "660a75e7dd2eebfca0329a24" (_id)}
          await viewSingleChatFn(io, socket, data);
        });
  
        // Event handler for creating group
        socket.on("createGroup", async (data) => {
          //data : {users: [{id: "3", isParent: false}, {id: "3", isParent: true}, {id: "544", isParent: false}](_id), name: "studentGroup of school", profile: "profile.jpg", about: "in this group you receive school important information"} // at one time only 10 user add in a group
          await createGroup(io, socket, data);
        });
  
        // Event handler for making group is private or un private
        socket.on("groupPrivate", async (data) => {
          //data : {id: "660a75e7dd2eebfca0329a24" (_id)}
          await groupPrivate(io, socket, data);
        });
  
        // Event handler for add user in a group, only admin have allow to add
        socket.on("addToGroup", async (data) => {
          //data : {users: [{id: "3", isParent: false}, {id: "3", isParent: true}, {id: "544", isParent: false}](_id), id: "660a75e7dd2eebfca0329a24" (_id)} // at one time only 10 user add in a group
          await addToGroup(io, socket, data);
        });
  
        // Event handler for audioCall
        socket.on("audioCall", async (data) => {
          //data : {id: 662b4f7b72975e3f85cfb169 (_id),
          //     "candidate": {
          //         "sdpMid": "data",
          //             "sdp": "candidate:3542374810 1 udp 2122131711 2401:4900:83bb:5a5a:c4f8:fb93:f34c:acdb 64955 typ host generation 0 ufrag UXEN network-id 14 network-cost 900",
          //                 "sdpMLineIndex": 2
          //     }, "type": "candidate"
          // }
          await audioCall(io, socket, data);
        });
  
        // Event handler for video
        socket.on("videoCall", async (data) => {
          //data : {id: 662b4f7b72975e3f85cfb169 (_id),
          //     "candidate": {
          //         "sdpMid": "data",
          //             "sdp": "candidate:3542374810 1 udp 2122131711 2401:4900:83bb:5a5a:c4f8:fb93:f34c:acdb 64955 typ host generation 0 ufrag UXEN network-id 14 network-cost 900",
          //                 "sdpMLineIndex": 2
          //     }, "type": "candidate"
          // }
          await videoCall(io, socket, data);
        });
  
        // Event handler for pickupAudioCall
        socket.on("pickupAudioCall", async (data) => {
          //data : {id: 662b4f7b72975e3f85cfb169 (_id), "audioCallId": "667d0f2b141c7613afaa6375",
          //     "candidate": {
          //         "sdpMid": "data",
          //             "sdp": "candidate:3542374810 1 udp 2122131711 2401:4900:83bb:5a5a:c4f8:fb93:f34c:acdb 64955 typ host generation 0 ufrag UXEN network-id 14 network-cost 900",
          //                 "sdpMLineIndex": 2
          //     }, "type": "candidate"
          // }
          await pickupAudioCall(io, socket, data);
        });
  
        // Event handler for pickupVideoCall
        socket.on("pickupVideoCall", async (data) => {
          //data : {id: 662b4f7b72975e3f85cfb169 (_id), "videoCallId": "667d0f2b141c7613afaa6375",
          //     "candidate": {
          //         "sdpMid": "data",
          //             "sdp": "candidate:3542374810 1 udp 2122131711 2401:4900:83bb:5a5a:c4f8:fb93:f34c:acdb 64955 typ host generation 0 ufrag UXEN network-id 14 network-cost 900",
          //                 "sdpMLineIndex": 2
          //     }, "type": "candidate"
          // }
          await pickupVideoCall(io, socket, data);
        });
  
        // Event handler for search user
        socket.on("searchUser", async (data) => {
          //data : {key: "name"}
          await searchUser(io, socket, data);
        });
  
        // Event handler for delete message from everyone
        socket.on("deleteFromEveryOne", async (data) => {
          //data : {id: "6631d306d045a7532367bb5a" (_id), messageId: "660a75e7dd2eebfca0329a24"}
          await deleteFromEveryOne(io, socket, data);
        });
  
        // Event handler for typing status
        socket.on("isTyping", async (data) => {
          //data : {id: "6631d306d045a7532367bb5a" (_id), isTyping: false/true}
          await isTyping(io, socket, data);
        });
  
        // Event handler for disconnecting sockets
        socket.on("disconnect", async () => {
          await disconnect(io, socket);
        });
      } catch (error) {
        console.error("Error in socket connection:", error.message);
      }
    });
  }