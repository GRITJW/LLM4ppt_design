# Asset safety

The starter depends on PptxGenJS 4.x. Its current transitive `image-size` dependency has published denial-of-service advisories for malformed ICNS, JXL, and HEIF inputs. The upstream audit currently offers no compatible fixed PptxGenJS release.

Until the dependency chain is fixed:

- accept only trusted image assets;
- prefer PNG, JPG, and SVG;
- do not process untrusted ICNS, JXL, or HEIF files;
- cap asset file size before ingestion in any server or multi-user deployment;
- run generation in a resource-limited process when accepting external uploads;
- rerun `npm audit` when updating dependencies.

This local authoring starter is not an upload service. Anyone turning it into a web service must add validation, timeouts, quotas, and sandboxing.
