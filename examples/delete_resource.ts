import { DeleteResourceRequest } from "kessel-sdk/kessel/inventory/v1beta2/delete_resource_request";
import { client } from "./client";

const deleteResourceRequest: DeleteResourceRequest = {
  reference: {
    resourceType: "host",
    resourceId: "854589f0-3be7-4cad-8bcd-45e18f33cb81",
    reporter: {
      type: "HBI",
    },
  },
};

(async () => {
  try {
    const response = await client.deleteResource(deleteResourceRequest);
    console.log("Delete Resource response received successfully:");
    console.log(response);
  } catch (e) {
    console.log("gRPC error occurred during Delete Resource:");
    console.log(`Exception:`, e);
  }
})();
