async function seed() {
  console.log("Seeding more assets to the database...");

  const assets = [
    {
      title: "Southern Ocean Sea Ice Extent Data 2023",
      content_type: "dataset",
      description: "Daily sea ice extent measurements derived from satellite microwave radiometer data for the Southern Ocean.",
      review_status: "approved",
      station_id: "Bharati Station",
      research_theme: "Climate Change",
      year: 2023,
      region: "antarctica"
    },
    {
      title: "Ny-Ålesund Atmospheric Monitoring Report",
      content_type: "report",
      description: "Continuous monitoring of greenhouse gases and aerosols from the Himadri Station in Svalbard.",
      review_status: "approved",
      station_id: "Himadri Station",
      research_theme: "Climate Change",
      year: 2021,
      region: "arctic"
    },
    {
      title: "Maitri Station Logistics & Operations Manual",
      content_type: "institutional_activity",
      description: "Standard operating procedures for wintering teams at Maitri Station.",
      review_status: "approved",
      station_id: "Maitri Station",
      year: 2020,
      region: "antarctica"
    },
    {
      title: "Schirmacher Oasis Geological Survey",
      content_type: "report",
      description: "Detailed mapping of rock formations and structural geology of the Schirmacher Oasis.",
      review_status: "approved",
      station_id: "Maitri Station",
      year: 2018,
      region: "antarctica"
    },
    {
      title: "Himalayan Glacier Retreat Time-lapse",
      content_type: "video",
      description: "Time-lapse photography showing the retreat of the Bara Shigri glacier over a decade.",
      review_status: "approved",
      research_theme: "Glaciology",
      year: 2023,
      region: "himalaya"
    },
    {
      title: "Microbial Diversity in Subglacial Lakes",
      content_type: "publication",
      description: "Research paper on the unique microbial communities discovered in Antarctic subglacial water samples.",
      review_status: "approved",
      station_id: "Bharati Station",
      research_theme: "Polar Biology",
      year: 2019,
      region: "antarctica"
    },
    {
      title: "Arctic Fox Population Dynamics",
      content_type: "dataset",
      description: "Population tracking data for Arctic foxes in the Svalbard archipelago.",
      review_status: "approved",
      station_id: "Himadri Station",
      research_theme: "Polar Biology",
      year: 2015,
      region: "arctic"
    },
    {
      title: "Aurora Australis Over Maitri",
      content_type: "photograph",
      description: "Long-exposure photograph of the Southern Lights captured during the polar night.",
      review_status: "approved",
      station_id: "Maitri Station",
      year: 2022,
      region: "antarctica"
    },
    {
      title: "Global Ocean Circulation Models",
      content_type: "research_project",
      description: "Project outlining the integration of polar ocean data into global climate circulation models.",
      review_status: "approved",
      research_theme: "Climate Change",
      year: 2024,
      region: "global"
    },
    {
      title: "Indian Antarctic Program 40th Anniversary",
      content_type: "news",
      description: "Press release celebrating 40 years of successful Indian scientific expeditions to Antarctica.",
      review_status: "approved",
      year: 2021,
      region: "antarctica"
    }
  ];

  for (const asset of assets) {
    await base44.entities.Asset.create(asset);
  }

  console.log(`Successfully seeded ${assets.length} new assets!`);
}

seed().catch(console.error);
