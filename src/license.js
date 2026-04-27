const usagePolicy = {
  commercial_website: {
    commercial: true,
    allowEditorial: false,
    allowAttribution: true,
    requiresRawRedistribution: false
  },
  social_media_post: {
    commercial: true,
    allowEditorial: false,
    allowAttribution: true,
    requiresRawRedistribution: false
  },
  presentation: {
    commercial: true,
    allowEditorial: false,
    allowAttribution: true,
    requiresRawRedistribution: false
  },
  advertisement: {
    commercial: true,
    allowEditorial: false,
    allowAttribution: false,
    requiresRawRedistribution: false
  },
  app_ui: {
    commercial: true,
    allowEditorial: false,
    allowAttribution: false,
    requiresRawRedistribution: false
  },
  print_material: {
    commercial: true,
    allowEditorial: false,
    allowAttribution: false,
    requiresRawRedistribution: false
  },
  template_for_resale: {
    commercial: true,
    allowEditorial: false,
    allowAttribution: false,
    requiresRawRedistribution: true
  }
};

export function validateUsage(asset, usage, options = {}) {
  const policy = usagePolicy[usage];
  if (!policy) {
    return deny(`Unsupported usage "${usage}".`);
  }

  const license = asset.license || {};
  const requireNoAttribution = Boolean(options.requireNoAttribution);

  if (policy.commercial && !license.commercialAllowed) {
    return deny("Asset license does not allow commercial use.");
  }

  if (!policy.allowEditorial && license.editorialOnly) {
    return deny("Editorial-only assets are not allowed for this usage.");
  }

  if ((requireNoAttribution || !policy.allowAttribution) && license.attributionRequired) {
    return deny("Asset requires attribution.");
  }

  if (policy.requiresRawRedistribution && !license.rawRedistributionAllowed) {
    return deny("Asset cannot be used in products/templates intended for resale.");
  }

  return {
    approved: true,
    reason: "Asset usage is allowed by normalized policy.",
    requiredAttribution: license.attributionRequired ? asset.attribution || null : null
  };
}

export function normalizeLicense(partial) {
  return {
    commercialAllowed: Boolean(partial.commercialAllowed),
    attributionRequired: Boolean(partial.attributionRequired),
    rawRedistributionAllowed: Boolean(partial.rawRedistributionAllowed),
    editorialOnly: Boolean(partial.editorialOnly),
    source: partial.source || "",
    licenseUrl: partial.licenseUrl || ""
  };
}

function deny(reason) {
  return {
    approved: false,
    reason,
    requiredAttribution: null
  };
}
