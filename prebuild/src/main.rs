use std::error::Error;
use std::fs::File;
use std::io::Read;

use comrak::nodes::{AstNode, NodeValue};
use comrak::{parse_document, Arena, ComrakOptions};
use docx_rs::*;
use lazy_static::lazy_static;

/// CV builder that builds my CV from markdown.

/// CV.md path.
const CV_PATH: &str = "../content/_cv.md";

/// Output docx path.
const CV_DOCX_OUTPUT_PATH: &str = "cv.docx";

/// Full name.
const FULL_NAME: &str = "Caitlin Wilks";

/// Email address.
const EMAIL_ADDRESS: &str = "cat@cat.bio";

/// Website url.
const URL: &str = "https://cat.bio/";

lazy_static! {
    /// The default fonts.
    static ref DEFAULT_FONTS: RunFonts = RunFonts::new().ascii("OpenSans");

    /// The style for H1 elements.
    static ref HEADING_1: Style = Style::new("Heading1", StyleType::Paragraph)
        .size(50)
        .bold();

    /// The style for H2 elements.
    static ref HEADING_2: Style = Style::new("Heading2", StyleType::Paragraph)
        .size(45)
        .bold();

    /// The style for H3 elements.
    static ref HEADING_3: Style = Style::new("Heading3", StyleType::Paragraph)
        .size(40)
        .bold();

    /// The style for H4 elements.
    static ref HEADING_4: Style = Style::new("Heading4", StyleType::Paragraph)
        .size(35)
        .bold();

    /// The style for paragraphs.
    static ref PARAGRAPH: Style = Style::new("Paragraph", StyleType::Paragraph)
        .size(24);
}

/// Iterate the nodes in a markdown document, calling a callback for every node.
fn iter_nodes<'a, F>(node: &'a AstNode<'a>, depth: usize, f: &mut F) -> Result<(), Box<dyn Error>>
    where F: FnMut(&'a AstNode<'a>, usize) -> Result<(), Box<dyn Error>>
{
    f(node, depth)?;
    for c in node.children() {
        iter_nodes(c, depth+1, f)?;
    }
    Ok(())
}

/// Skip the front matter at the front of zola markdown documents.
fn skip_front_matter(text: &str) -> &str {
    // Find the second instance of "+++" and skip it, probably not the most robust but it works for my use.
    if let Some(first) = text.find("+++") {
        if let Some(second) = text[first+3..].find("+++") {
            // Add back the 3 characters we skipped earlier.
            let second = second + 3;
            log::info!("Found front matter at {first}..{second}, skipping");
            &text[second+3..]
        }
        else {
            log::info!("Found front matter start at {first} but didn't find end");
            text
        }
    }
    else {
        log::info!("No front matter in document");
        text
    }
}

/// Generate an indentation string with n spaces in.
fn indent(n: usize) -> String {
    const INDENT_SIZE: usize = 4;
    std::iter::repeat(" ").take(n * INDENT_SIZE).collect()
}

fn main() -> Result<(), Box<dyn Error>> {
    env_logger::init();

    // Create doc and initialize fonts and styles.
    let mut doc = Docx::new()
        .default_fonts(DEFAULT_FONTS.clone())
        .add_style(HEADING_1.clone())
        .add_style(HEADING_2.clone())
        .add_style(HEADING_3.clone())
        .add_style(HEADING_4.clone())
        .add_style(PARAGRAPH.clone())
        // TODO: add to lazy statics
        .page_margin(PageMargin::new().top(1000).bottom(1000).right(1000).left(1000));

    // Add name and email.
    log::info!("Adding name, email, and photo");
    let mut img = File::open("../static/images/headshot.jpg")?;
    let mut buf = Vec::new();
    img.read_to_end(&mut buf)?;

    let mut pic = Pic::new(&buf).size(150 * 9525, 150 * 9525);
    pic.id = "blah".to_string();
    pic.position_v = DrawingPosition::Align(PicAlign::Right);

    let table = Table::new(vec![
        TableRow::new(vec![
            TableCell::new().add_paragraph(
                Paragraph::new().add_run(Run::new().add_image(pic))
            ).width(2500, WidthType::Dxa),
            TableCell::new().add_paragraph(
                Paragraph::new().align(AlignmentType::Center).add_run(
                    Run::new()
                        .add_text(FULL_NAME)
                        .size(50)
                        .bold()
                        .add_break(BreakType::TextWrapping)
                ).add_run(
                    Run::new()
                        .add_text(EMAIL_ADDRESS)
                        .size(30)
                        .add_break(BreakType::TextWrapping)
                ).add_run(
                    // TODO: link?
                    Run::new()
                        .add_text(URL)
                        .size(30)
                ).add_hyperlink(Hyperlink::new(URL, HyperlinkType::External))
            ).width(5000, WidthType::Dxa).vertical_align(VAlignType::Center)
        ])
    ]).align(TableAlignmentType::Center).layout(TableLayoutType::Fixed).clear_all_border();

    doc = doc.add_table(table);

    // Parse markdown document.
    let arena = Arena::new();
    let markdown = std::fs::read_to_string(CV_PATH)?;
    let root = parse_document(&arena, skip_front_matter(&markdown), &ComrakOptions {
        ..Default::default()
    });

    // Iterate document.
    let mut paragraph = Paragraph::new();
    iter_nodes(&root, 0, &mut |node, depth| {
        match &node.data.borrow().value {
            NodeValue::Heading(heading) => {
                log::debug!("{}Heading {}", indent(depth), heading.level);

                if !paragraph.children().is_empty() {
                    doc = std::mem::take(&mut doc).add_paragraph(std::mem::take(&mut paragraph));
                }

                paragraph = match heading.level {
                    1 => Paragraph::new().style(&HEADING_1.style_id),
                    2 => Paragraph::new().style(&HEADING_2.style_id),
                    3 => Paragraph::new().style(&HEADING_3.style_id),
                    4 => Paragraph::new().style(&HEADING_4.style_id),
                    _ => Paragraph::new()
                }
            },
            NodeValue::Paragraph => {
                log::debug!("{}New paragraph", indent(depth));

                if !paragraph.children().is_empty() {
                    doc = std::mem::take(&mut doc).add_paragraph(std::mem::take(&mut paragraph));
                }

                paragraph = Paragraph::new().style(&PARAGRAPH.style_id);
            },
            NodeValue::Text(text) => {
                let text = std::str::from_utf8(&text)?;
                paragraph = std::mem::take(&mut paragraph)
                    .add_run(Run::new().add_text(text));
                //doc = std::mem::take(&mut doc)
                //    .add_paragraph(Paragraph::new()
                //    .style(&PARAGRAPH.style_id)
                //    .add_run(Run::new().add_text(text)));
                log::debug!("{}Text: {}", indent(depth), text);
            },
            _ => {}
        }

        Ok(())
    })?;

    if !paragraph.children().is_empty() {
        doc = doc.add_paragraph(paragraph);
    }

    let doc = doc.add_paragraph(Paragraph::new()
        .style(&HEADING_1.style_id)
        .add_run(Run::new().add_text("Hello"))
    );

    // Write output file.
    log::info!("Writing output file");
    let file = File::create(CV_DOCX_OUTPUT_PATH).unwrap();

    doc.build().pack(file).unwrap();

    Ok(())
}
