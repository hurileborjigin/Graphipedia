const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NodeSchema = new Schema({
  title: {
    type: String,
    maxLength: 360,
    required: true,
  },
  inboundLinks: {
    type: Schema.Types.ObjectId,
    default: [],
  },
  outBoundLinks: [
    {
      type: Schema.Types.ObjectId,
      default: [],
    },
  ],
});

module.exports = Node = mongoose.model("Node", NodeSchema);
