const { msg } = require("../../../../config/message");
const { User } = require("../../user/models/user.model");
// const { ThumbnailGenerator } = require("../../../helpers/thumbnails/thumbnailGenerator.helpers");

const uploadVideo = async (user, query, files) => {
  if (!files) throw new Error("upload files");
  let ChatDocument = await files.chatDocument[0].key;
  const trimmedString = files.chatDocument[0].key;
  thumbnail = await ThumbnailGenerator(trimmedString);
  return { ChatDocument: ChatDocument, thumbnail: thumbnail };
};

const uploadDocument = async (user, query, files) => {
  if (!files) throw new Error("upload files");
  let ChatDocument = await files.chatDocument[0].key;
  return { ChatDocument: ChatDocument };
};

module.exports = {
  uploadVideo,
  uploadDocument,
};
