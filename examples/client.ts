// import { ClientBuilder } from "kessel-sdk/kessel/inventory/v1beta2";

// Create a connections without any secure credentials and connects to localhost:9081
// Uses default for everything else
import {ClientBuilder} from "../src/kessel/inventory/v1beta2";
// import {ChannelCredentials} from "nice-grpc"; // If configuring the channel credentials

export const client = ClientBuilder.builder()
  .withInsecureCredentials()
  // .withCredentials(ChannelCredentials.createSsl())
  .withTarget("localhost:9081")
  .build();
