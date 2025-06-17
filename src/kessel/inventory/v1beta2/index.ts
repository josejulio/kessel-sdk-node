import { createChannel, createClient } from "nice-grpc";
import {
  KesselInventoryServiceClient,
  KesselInventoryServiceDefinition,
} from "./inventory_service";
import { ChannelCredentials } from "@grpc/grpc-js";
import { ChannelOptions } from "@grpc/grpc-js/src/channel-options";
import {VerifyOptions} from "@grpc/grpc-js/src/channel-credentials";

export class IncompleteKesselConfigurationError extends Error {
  public constructor(fields: Array<string>) {
    super(
      `IncompleteKesselConfigurationError: Missing the following fields to build: ${fields.join(",")}`,
    );
  }
}

export interface ClientConfigKeepAlive {
  timeMs: number | undefined;
  timeoutMs: number | undefined;
  permitWithoutCalls: boolean | undefined;
}

export interface ClientConfig {
  target: string;
  credentials?: ChannelCredentials;
  keepAlive?: ClientConfigKeepAlive;
}

export const defaultKeepAlive = (): ClientConfigKeepAlive => {
  return {
    timeMs: 10000,
    timeoutMs: 5000,
    permitWithoutCalls: true,
  };
};

export const defaultCredentials = (): ChannelCredentials => {
  return ChannelCredentials.createSsl();
};

export class ClientBuilder {
  private _target: string | undefined;
  private _credentials: ChannelCredentials | undefined;
  private _keepAlive: ClientConfigKeepAlive;

  get target() {
    return this._target;
  }

  get credentials(): Readonly<ChannelCredentials> {
    return this._credentials;
  }

  get keepAlive(): Readonly<ClientConfigKeepAlive> {
    return this._keepAlive;
  }

  private constructor() {
    this._keepAlive = defaultKeepAlive();
    this._credentials = defaultCredentials();
  }

  private validate() {
    const missingFields: Array<string> = [];

    if (!this._target) {
      missingFields.push("target");
    }

    if (missingFields.length > 0) {
      throw new IncompleteKesselConfigurationError(missingFields);
    }
  }

  public static builder(): ClientBuilder {
    return new ClientBuilder();
  }

  public static builderFromConfig(config: ClientConfig): ClientBuilder {
    config.keepAlive = { ...defaultKeepAlive(), ...config.keepAlive };
    if (!config.credentials) {
      config.credentials = defaultCredentials();
    }

    return ClientBuilder.builder()
      .withTarget(config.target)
      .withKeepAlive(
        config.keepAlive.timeMs,
        config.keepAlive.timeoutMs,
        config.keepAlive.permitWithoutCalls,
      )
      .withCredentials(config.credentials);
  }

  public withTarget(target: string): ClientBuilder {
    this._target = target;
    return this;
  }

  /**
   * @see ChannelCredentials.createSsl(), ChannelCredentials.createFromSecureContext() and ChannelCredentials.createInsecure()
   * @param credentials
   */
  public withCredentials(credentials: ChannelCredentials): ClientBuilder {
    this._credentials = credentials;
    return this;
  }

  public withInsecureCredentials(): ClientBuilder {
    this._credentials = ChannelCredentials.createInsecure();
    return this;
  }

  public withKeepAlive(
    timeMs: number,
    timeoutMs: number,
    permitWithoutCalls: boolean,
  ): ClientBuilder {
    this._keepAlive = {
      timeMs,
      timeoutMs,
      permitWithoutCalls: permitWithoutCalls,
    };

    return this;
  }

  public build(): KesselInventoryServiceClient {
    this.validate();
    const options: ChannelOptions = {};

    if (this._keepAlive) {
      options["grpc.keepalive_time_ms"] = this._keepAlive.timeMs;
      options["grpc.keepalive_timeout_ms"] = this._keepAlive.timeoutMs;
      options["grpc.keepalive_permit_without_calls"] = this._keepAlive
        .permitWithoutCalls
        ? 1
        : 0;
    }

    const channel = createChannel(this._target, this._credentials, options);

    return createClient(KesselInventoryServiceDefinition, channel);
  }
}
